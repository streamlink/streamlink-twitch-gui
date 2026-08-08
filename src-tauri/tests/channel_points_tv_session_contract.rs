#[test]
fn channel_points_uses_dedicated_tv_session() {
    let lib = include_str!("../src/lib.rs");
    let presence = include_str!("../src/viewer_presence.rs");
    let points = include_str!("../src/channel_points.rs");
    let auth_ui = include_str!("../../src/components/ChannelPointsAuth.tsx");

    assert!(lib.contains("mod channel_points_auth;"));
    assert!(lib.contains("channel_points_auth_start_device_login"));
    assert!(lib.contains("channel_points_auth_poll_device_login"));
    assert!(lib.contains("channel_points_auth_clear"));

    assert!(presence.contains("channel_points_auth::load_session"));
    assert!(presence.contains("channel_points_auth::TV_CLIENT_ID"));
    assert!(presence.contains("channel_points_auth::client_session_id"));

    assert!(points.contains("channel_points_auth::load_session"));
    assert!(points.contains("channel_points_auth::TV_CLIENT_ID"));
    assert!(points.contains("channel_points_auth::client_session_id"));

    assert!(auth_ui.contains("channel_points_auth_start_device_login"));
    assert!(auth_ui.contains("channel_points_auth_poll_device_login"));

    // This experiment isolates passive watch credit. Protected bonus claims stay off
    // until repeated +10 awards prove the TV session works reliably.
    assert!(!points.contains("ClaimCommunityPoints"));
}
