#[cfg(test)]
mod tests {
    use super::*;

    fn target(session_id: &str, login: &str) -> ViewerPresenceTarget {
        ViewerPresenceTarget {
            session_id: session_id.into(),
            channel_login: login.into(),
            channel_id: "1234".into(),
            broadcast_id: format!("broadcast-{session_id}"),
        }
    }

    #[test]
    fn base64_encodes_without_padding_errors() {
        assert_eq!(base64_encode(b""), "");
        assert_eq!(base64_encode(b"f"), "Zg==");
        assert_eq!(base64_encode(b"fo"), "Zm8=");
        assert_eq!(base64_encode(b"foo"), "Zm9v");
        assert_eq!(base64_encode(b"foobar"), "Zm9vYmFy");
    }

    #[test]
    fn payload_uses_real_stream_and_viewer_identifiers() {
        let value = build_minute_watched_payload(&target("s1", "Example_Channel"), "9001");
        let parsed: serde_json::Value = serde_json::from_str(&value).unwrap();
        let properties = &parsed[0]["properties"];

        assert_eq!(parsed[0]["event"], "minute-watched");
        assert_eq!(properties["channel_id"], "1234");
        assert_eq!(properties["broadcast_id"], "broadcast-s1");
        assert_eq!(properties["user_id"], "9001");
        assert_eq!(properties["channel"], "example_channel");
        assert_eq!(properties["player"], "site");
        assert_eq!(properties["live"], true);
    }

    #[test]
    fn selection_deduplicates_valid_targets_and_caps_at_two() {
        let selected = select_targets(vec![
            target("s1", "one"),
            target("s1", "duplicate"),
            target("s2", "two"),
            target("s3", "three"),
            ViewerPresenceTarget {
                session_id: "bad".into(),
                channel_login: "invalid-login".into(),
                channel_id: "not-digits".into(),
                broadcast_id: "".into(),
            },
        ]);

        assert_eq!(selected.len(), 2);
        assert_eq!(selected[0].session_id, "s1");
        assert_eq!(selected[1].session_id, "s2");
    }

    #[test]
    fn extracts_runtime_settings_and_spade_urls() {
        let html = r#"<script src="https://static.twitchcdn.net/config/settings.abc123.js"></script>"#;
        assert_eq!(
            extract_settings_url(html),
            Some("https://static.twitchcdn.net/config/settings.abc123.js".into())
        );

        let settings = r#"window.__settings={"spade_url":"https://spade.twitch.tv/track"};"#;
        assert_eq!(
            extract_spade_url(settings),
            Some("https://spade.twitch.tv/track".into())
        );
    }
}
