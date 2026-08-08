#[test]
fn spade_post_does_not_send_referer_header() {
    let source = include_str!("../src/viewer_presence.rs");
    let start = source
        .find("async fn send_minute_watched(")
        .expect("send_minute_watched exists");
    let tail = &source[start..];
    let end = tail
        .find("pub(crate) fn build_minute_watched_payload")
        .expect("payload helper follows send_minute_watched");
    let body = &tail[..end];

    assert!(body.contains(".header(USER_AGENT, USER_AGENT_VALUE)"));
    assert!(!body.contains(".header(REFERER, TWITCH_URL)"));
}
