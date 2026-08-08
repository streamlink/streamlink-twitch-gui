#[test]
fn hls_probe_matches_current_web_player_contract() {
    let source = include_str!("../src/viewer_presence.rs");

    assert!(
        source.contains("const USHER_URL: &str = \"https://usher.ttvnw.net/api/channel/hls/\";")
    );

    let build_start = source
        .find("fn build_usher_url(")
        .expect("build_usher_url exists");
    let build_tail = &source[build_start..];
    let build_end = build_tail
        .find("async fn fetch_text(")
        .expect("fetch_text follows build_usher_url");
    let build_body = &build_tail[..build_end];
    assert!(build_body.contains(".append_pair(\"sig\", signature)"));
    assert!(build_body.contains(".append_pair(\"token\", token)"));
    assert!(build_body.contains(".append_pair(\"cdm\", \"wv\")"));
    assert!(build_body.contains(".append_pair(\"player_version\", \"1.22.0\")"));
    assert!(build_body.contains(".append_pair(\"player_type\", \"pulsar\")"));
    assert!(build_body.contains(".append_pair(\"player_backend\", \"mediaplayer\")"));
    assert!(build_body.contains(".append_pair(\"playlist_include_framerate\", \"true\")"));
    assert!(build_body.contains(".append_pair(\"allow_source\", \"true\")"));
    assert!(build_body.contains(".append_pair(\"transcode_mode\", \"cbr_v1\")"));
    assert!(!build_body.contains(".append_pair(\"platform\""));
    assert!(!build_body.contains(".append_pair(\"p\""));
    assert!(!build_body.contains(".append_pair(\"allow_audio_only\""));
    assert!(!build_body.contains(".append_pair(\"supported_codecs\""));

    let fetch_start = source
        .find("async fn fetch_text(")
        .expect("fetch_text exists");
    let fetch_tail = &source[fetch_start..];
    let fetch_end = fetch_tail
        .find("async fn response_text(")
        .expect("response_text follows fetch_text");
    let fetch_body = &fetch_tail[..fetch_end];
    assert!(fetch_body.contains(".header(USER_AGENT, USER_AGENT_VALUE)"));
    assert!(!fetch_body.contains(".header(REFERER, TWITCH_URL)"));

    let segment_start = source
        .find("async fn touch_media_segment(")
        .expect("touch_media_segment exists");
    let segment_tail = &source[segment_start..];
    let segment_end = segment_tail
        .find("fn validate_https_url(")
        .expect("validate_https_url follows touch_media_segment");
    let segment_body = &segment_tail[..segment_end];
    assert!(segment_body.contains(".header(USER_AGENT, USER_AGENT_VALUE)"));
    assert!(!segment_body.contains(".header(REFERER, TWITCH_URL)"));
}
