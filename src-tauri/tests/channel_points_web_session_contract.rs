#[test]
fn channel_points_uses_website_session() {
    let lib = include_str!("../src/lib.rs");
    let presence = include_str!("../src/viewer_presence.rs");
    let points = include_str!("../src/channel_points.rs");
    let auth_bar = include_str!("../../src/components/AuthBar.tsx");
    let website_auth = include_str!("../../src/components/TwitchWebsiteAuth.tsx");

    assert!(!lib.contains("mod channel_points_auth;"));
    assert!(!lib.contains("channel_points_auth_start_device_login"));
    assert!(!lib.contains("channel_points_auth_poll_device_login"));
    assert!(!lib.contains("channel_points_auth_clear"));

    assert!(presence.contains("twitch_web_auth::load_session"));
    assert!(presence.contains("twitch_web_auth::WEB_CLIENT_ID"));
    assert!(presence.contains("twitch_web_auth::client_session_id"));
    assert!(presence.contains("format!(\"OAuth {token}\")"));
    assert!(!presence.contains("channel_points_auth::"));

    assert!(points.contains("twitch_web_auth::load_session"));
    assert!(points.contains("twitch_web_auth::WEB_CLIENT_ID"));
    assert!(points.contains("twitch_web_auth::client_session_id"));
    assert!(points.contains("format!(\"OAuth {token}\")"));
    assert!(!points.contains("channel_points_auth::"));

    assert!(auth_bar.contains("TwitchWebsiteAuth"));
    assert!(!auth_bar.contains("ChannelPointsAuth"));
    assert!(website_auth.contains("syncViewerPresence(true)"));

    // Protected bonus claims remain out of scope for passive watch credit.
    assert!(!points.contains("ClaimCommunityPoints"));
}
