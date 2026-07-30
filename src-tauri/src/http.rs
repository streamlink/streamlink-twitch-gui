use std::sync::OnceLock;
use std::time::Duration;

/// Shared reqwest client: connection pooling plus sane timeouts so a stalled
/// network can never hang auth/Helix calls (or the UI waiting on them) forever.
pub fn shared_client() -> &'static reqwest::Client {
    static CLIENT: OnceLock<reqwest::Client> = OnceLock::new();
    CLIENT.get_or_init(|| {
        reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(5))
            .timeout(Duration::from_secs(15))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new())
    })
}
