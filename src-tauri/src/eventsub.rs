//! Twitch EventSub WebSocket — outgoing `channel.raid` for watched channels.

use std::collections::{HashMap, HashSet};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, OnceLock};
use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio::sync::Notify;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::auth;
use crate::http::shared_client;

const WS_URL: &str = "wss://eventsub.wss.twitch.tv/ws";
const HELIX_EVENTSUB: &str = "https://api.twitch.tv/helix/eventsub/subscriptions";

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RaidOutgoing {
    pub from_channel: String,
    pub to_channel: String,
    pub to_user_id: String,
    pub viewers: Option<u64>,
}

struct EventSubState {
    enabled: bool,
    /// Lowercase logins the UI wants watched for outgoing raids.
    logins: HashSet<String>,
}

fn state() -> &'static Mutex<EventSubState> {
    static S: OnceLock<Mutex<EventSubState>> = OnceLock::new();
    S.get_or_init(|| {
        Mutex::new(EventSubState {
            enabled: true,
            logins: HashSet::new(),
        })
    })
}

fn wake() -> &'static Notify {
    static N: OnceLock<Notify> = OnceLock::new();
    N.get_or_init(Notify::new)
}

static STARTED: AtomicBool = AtomicBool::new(false);

pub fn init(app: AppHandle) {
    if STARTED.swap(true, Ordering::SeqCst) {
        return;
    }
    tauri::async_runtime::spawn(async move {
        run_supervisor(app).await;
    });
}

/// Enable/disable + replace the watched login set (lowercase).
pub fn sync(enabled: bool, logins: Vec<String>) {
    if let Ok(mut g) = state().lock() {
        g.enabled = enabled;
        g.logins = logins
            .into_iter()
            .map(|s| s.to_ascii_lowercase())
            .filter(|s| !s.is_empty())
            .collect();
    }
    wake().notify_waiters();
}

async fn run_supervisor(app: AppHandle) {
    let mut backoff = Duration::from_secs(1);
    loop {
        let (enabled, logins) = {
            let g = state().lock().ok();
            match g {
                Some(g) => (g.enabled, g.logins.clone()),
                None => (false, HashSet::new()),
            }
        };
        if !enabled || logins.is_empty() {
            // Idle until sync wakes us.
            wake().notified().await;
            continue;
        }
        match run_session(app.clone(), logins).await {
            Ok(()) => {
                backoff = Duration::from_secs(1);
            }
            Err(e) => {
                eprintln!("[eventsub] session ended: {e}");
                tokio::time::sleep(backoff).await;
                backoff = (backoff * 2).min(Duration::from_secs(60));
            }
        }
    }
}

async fn run_session(app: AppHandle, initial_logins: HashSet<String>) -> Result<(), String> {
    let token = auth::token_for_api()
        .await
        .map_err(|e| format!("auth: {e}"))?;
    let client_id = auth::public_client_id().map_err(|e| format!("client id: {e}"))?;

    let (ws, _) = connect_async(WS_URL)
        .await
        .map_err(|e| format!("ws connect: {e}"))?;
    let (mut write, mut read) = ws.split();

    let mut session_id = String::new();
    // login -> subscription id
    let mut subs: HashMap<String, String> = HashMap::new();
    let mut desired = initial_logins;
    // login -> broadcaster user id cache
    let id_cache: Arc<Mutex<HashMap<String, String>>> = Arc::new(Mutex::new(HashMap::new()));

    loop {
        tokio::select! {
            _ = wake().notified() => {
                let (enabled, logins) = {
                    let g = state().lock().map_err(|e| e.to_string())?;
                    (g.enabled, g.logins.clone())
                };
                if !enabled || logins.is_empty() {
                    // Best-effort close; drop subscriptions by closing WS.
                    let _ = write.close().await;
                    return Ok(());
                }
                desired = logins;
                if !session_id.is_empty() {
                    sync_subscriptions(
                        &token,
                        &client_id,
                        &session_id,
                        &desired,
                        &mut subs,
                        &id_cache,
                    )
                    .await?;
                }
            }
            msg = read.next() => {
                let Some(msg) = msg else {
                    return Err("ws closed".into());
                };
                let msg = msg.map_err(|e| format!("ws read: {e}"))?;
                let text = match msg {
                    Message::Text(t) => t.to_string(),
                    Message::Ping(p) => {
                        let _ = write.send(Message::Pong(p)).await;
                        continue;
                    }
                    Message::Close(_) => return Err("ws close frame".into()),
                    _ => continue,
                };
                let parsed: WsEnvelope = serde_json::from_str(&text)
                    .map_err(|e| format!("ws json: {e}"))?;
                match parsed.metadata.message_type.as_str() {
                    "session_welcome" => {
                        session_id = parsed
                            .payload
                            .session
                            .as_ref()
                            .map(|s| s.id.clone())
                            .ok_or_else(|| "welcome missing session.id".to_string())?;
                        sync_subscriptions(
                            &token,
                            &client_id,
                            &session_id,
                            &desired,
                            &mut subs,
                            &id_cache,
                        )
                        .await?;
                    }
                    "session_keepalive" => {}
                    "session_reconnect" => {
                        // Twitch asks us to reconnect to a new URL; simplest is
                        // drop and let supervisor reconnect to the default URL.
                        let _ = write.close().await;
                        return Ok(());
                    }
                    "notification" => {
                        if let Some(raid) = parse_raid_notification(&parsed) {
                            let _ = app.emit("raid-outgoing", raid);
                        }
                    }
                    "revocation" => {
                        // Drop matching sub if present.
                        if let Some(sub) = parsed.payload.subscription.as_ref() {
                            subs.retain(|_, id| id != &sub.id);
                        }
                    }
                    _ => {}
                }
            }
        }
    }
}

async fn sync_subscriptions(
    token: &str,
    client_id: &str,
    session_id: &str,
    desired_logins: &HashSet<String>,
    subs: &mut HashMap<String, String>,
    id_cache: &Mutex<HashMap<String, String>>,
) -> Result<(), String> {
    // Remove stale
    let stale: Vec<String> = subs
        .keys()
        .filter(|l| !desired_logins.contains(*l))
        .cloned()
        .collect();
    for login in stale {
        if let Some(sub_id) = subs.remove(&login) {
            let _ = delete_subscription(token, client_id, &sub_id).await;
        }
    }
    // Add missing
    for login in desired_logins {
        if subs.contains_key(login) {
            continue;
        }
        let user_id = resolve_user_id(token, client_id, login, id_cache).await?;
        match create_raid_subscription(token, client_id, session_id, &user_id).await {
            Ok(sub_id) => {
                subs.insert(login.clone(), sub_id);
            }
            Err(e) => {
                eprintln!("[eventsub] subscribe {login}: {e}");
            }
        }
    }
    Ok(())
}

async fn resolve_user_id(
    token: &str,
    client_id: &str,
    login: &str,
    cache: &Mutex<HashMap<String, String>>,
) -> Result<String, String> {
    if let Ok(g) = cache.lock() {
        if let Some(id) = g.get(login) {
            return Ok(id.clone());
        }
    }
    let url = format!("https://api.twitch.tv/helix/users?login={login}");
    let res = shared_client()
        .get(&url)
        .header("Client-Id", client_id)
        .bearer_auth(token)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if !res.status().is_success() {
        let body = res.text().await.unwrap_or_default();
        return Err(format!("users lookup failed: {body}"));
    }
    let v: Value = res.json().await.map_err(|e| e.to_string())?;
    let id = v
        .pointer("/data/0/id")
        .and_then(|x| x.as_str())
        .ok_or_else(|| format!("no user id for {login}"))?
        .to_string();
    if let Ok(mut g) = cache.lock() {
        g.insert(login.to_string(), id.clone());
    }
    Ok(id)
}

async fn create_raid_subscription(
    token: &str,
    client_id: &str,
    session_id: &str,
    from_broadcaster_user_id: &str,
) -> Result<String, String> {
    let body = json!({
        "type": "channel.raid",
        "version": "1",
        "condition": {
            "from_broadcaster_user_id": from_broadcaster_user_id
        },
        "transport": {
            "method": "websocket",
            "session_id": session_id
        }
    });
    let res = shared_client()
        .post(HELIX_EVENTSUB)
        .header("Client-Id", client_id)
        .bearer_auth(token)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let status = res.status();
    let v: Value = res.json().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(format!("create sub {status}: {v}"));
    }
    v.pointer("/data/0/id")
        .and_then(|x| x.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("create sub missing id: {v}"))
}

async fn delete_subscription(token: &str, client_id: &str, id: &str) -> Result<(), String> {
    let url = format!("{HELIX_EVENTSUB}?id={id}");
    let res = shared_client()
        .delete(&url)
        .header("Client-Id", client_id)
        .bearer_auth(token)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    if res.status().is_success() || res.status().as_u16() == 404 {
        Ok(())
    } else {
        Err(format!("delete sub {}: {}", res.status(), res.text().await.unwrap_or_default()))
    }
}

#[derive(Debug, Deserialize)]
struct WsEnvelope {
    metadata: WsMeta,
    payload: WsPayload,
}

#[derive(Debug, Deserialize)]
struct WsMeta {
    message_type: String,
}

#[derive(Debug, Deserialize)]
struct WsPayload {
    #[serde(default)]
    session: Option<WsSession>,
    #[serde(default)]
    subscription: Option<WsSubscription>,
    #[serde(default)]
    event: Option<Value>,
}

#[derive(Debug, Deserialize)]
struct WsSession {
    id: String,
}

#[derive(Debug, Deserialize)]
struct WsSubscription {
    id: String,
    #[serde(rename = "type")]
    kind: String,
}

fn parse_raid_notification(env: &WsEnvelope) -> Option<RaidOutgoing> {
    let sub = env.payload.subscription.as_ref()?;
    if sub.kind != "channel.raid" {
        return None;
    }
    let event = env.payload.event.as_ref()?;
    let from = event
        .get("from_broadcaster_user_login")?
        .as_str()?
        .to_ascii_lowercase();
    let to = event
        .get("to_broadcaster_user_login")?
        .as_str()?
        .to_ascii_lowercase();
    let to_user_id = event.get("to_broadcaster_user_id")?.as_str()?.to_string();
    let viewers = event.get("viewers").and_then(|v| v.as_u64());
    Some(RaidOutgoing {
        from_channel: from,
        to_channel: to,
        to_user_id,
        viewers,
    })
}

#[cfg(test)]
fn parse_raid_notification_json(text: &str) -> Option<RaidOutgoing> {
    let env: WsEnvelope = serde_json::from_str(text).ok()?;
    if env.metadata.message_type != "notification" {
        return None;
    }
    parse_raid_notification(&env)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_channel_raid_notification() {
        let raw = r#"{
          "metadata": {
            "message_id": "1",
            "message_type": "notification",
            "message_timestamp": "2026-08-01T00:00:00Z",
            "subscription_type": "channel.raid",
            "subscription_version": "1"
          },
          "payload": {
            "subscription": {
              "id": "sub1",
              "status": "enabled",
              "type": "channel.raid",
              "version": "1",
              "condition": { "from_broadcaster_user_id": "111" },
              "transport": { "method": "websocket", "session_id": "s" },
              "created_at": "2026-08-01T00:00:00Z",
              "cost": 0
            },
            "event": {
              "from_broadcaster_user_id": "111",
              "from_broadcaster_user_login": "Alice",
              "from_broadcaster_user_name": "Alice",
              "to_broadcaster_user_id": "222",
              "to_broadcaster_user_login": "Bob",
              "to_broadcaster_user_name": "Bob",
              "viewers": 42
            }
          }
        }"#;
        let raid = parse_raid_notification_json(raw).expect("parse");
        assert_eq!(raid.from_channel, "alice");
        assert_eq!(raid.to_channel, "bob");
        assert_eq!(raid.to_user_id, "222");
        assert_eq!(raid.viewers, Some(42));
    }
}
