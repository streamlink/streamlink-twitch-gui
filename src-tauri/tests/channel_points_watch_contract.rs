#[test]
fn viewer_presence_matches_known_good_web_watch_contract() {
    let presence = include_str!("../src/viewer_presence.rs");

    assert!(presence.contains("\"playerType\": \"picture-by-picture\""));
    assert!(presence.contains(".append_pair(\"cdm\", \"wv\")"));
    assert!(presence.contains(".append_pair(\"player_version\", \"1.22.0\")"));
    assert!(presence.contains(".append_pair(\"player_type\", \"pulsar\")"));
    assert!(presence.contains(".append_pair(\"player_backend\", \"mediaplayer\")"));
    assert!(presence.contains(".append_pair(\"playlist_include_framerate\", \"true\")"));
    assert!(presence.contains(".append_pair(\"allow_source\", \"true\")"));
    assert!(presence.contains(".append_pair(\"transcode_mode\", \"cbr_v1\")"));

    assert!(presence.contains("\"hidden\": false"));
    assert!(presence.contains("\"logged_in\": true"));
    assert!(presence.contains("\"muted\": false"));
    assert!(presence.contains("\"location\": \"channel\""));

    assert!(presence.contains("const MIN_SUCCESS_INTERVAL_SECS: u64 = 55;"));
    assert!(presence.contains("const MAX_SUCCESS_INTERVAL_SECS: u64 = 70;"));
    assert!(presence.contains("fn success_interval() -> Duration"));
    assert!(!presence.contains("const SUCCESS_INTERVAL: Duration = Duration::from_secs(20);"));
}
