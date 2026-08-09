#[test]
fn channel_points_requires_authenticated_hermes_presence() {
    let realtime = include_str!("../src/channel_points_realtime.rs");
    let lib = include_str!("../src/lib.rs");

    assert!(realtime.contains("wss://hermes.twitch.tv/v1?clientId="));
    assert!(realtime.contains("https://www.twitch.tv"));
    assert!(realtime.contains("community-points-user-v1."));
    assert!(realtime.contains("video-playback-by-id."));
    assert!(realtime.contains("\"type\": \"authenticate\""));
    assert!(realtime.contains("\"token\": token"));
    assert!(lib.contains("channel_points_realtime::sync(enabled, &targets).await"));
    assert!(lib.contains("channel_points_realtime::is_ready()"));
    assert!(lib.contains("waiting for Twitch realtime presence"));
}
