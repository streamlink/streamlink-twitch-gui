#[test]
fn bonus_claim_uses_twitch_integrity_contract() {
    let source = include_str!("../src/channel_points.rs");

    assert!(source.contains("const INTEGRITY_URL: &str = \"https://gql.twitch.tv/integrity\";"));
    assert!(source.contains("\"Client-Integrity\""));
    assert!(source.contains("async fn fetch_integrity_token("));
    assert!(source.contains("fn integrity_error("));
    assert!(source.contains("force_refresh: bool"));
}
