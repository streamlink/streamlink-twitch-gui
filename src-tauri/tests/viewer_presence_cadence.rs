#[test]
fn successful_watch_heartbeat_matches_miner_cadence() {
    let source = include_str!("../src/viewer_presence.rs");
    assert!(
        source.contains("const SUCCESS_INTERVAL: Duration = Duration::from_secs(20);")
    );
}
