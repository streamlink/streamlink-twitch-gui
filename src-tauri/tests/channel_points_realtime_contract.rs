#[test]
fn channel_points_requires_authenticated_hermes_presence() {
    let realtime = include_str!("../src/channel_points_realtime.rs");
    let viewer_presence = include_str!("../src/viewer_presence.rs");

    assert!(realtime.contains("wss://hermes.twitch.tv/v1?clientId="));
    assert!(realtime.contains("https://www.twitch.tv"));
    assert!(realtime.contains("community-points-user-v1."));
    assert!(realtime.contains("video-playback-by-id."));
    assert!(realtime.contains("\"type\": \"authenticate\""));
    assert!(realtime.contains("\"token\": token"));
    assert!(viewer_presence.contains("channel_points_realtime::is_ready"));
    assert!(viewer_presence.contains("waiting for Twitch realtime presence"));
}
