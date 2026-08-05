#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use std::path::PathBuf;

    const TOKEN: &str = "abcdefghijklmnopqrstuvwxyz0123";
    const OTHER_TOKEN: &str = "zyxwvutsrqponmlkjihgfedcba3210";

    #[test]
    fn normalizes_supported_token_forms() {
        assert_eq!(normalize_token(TOKEN).unwrap(), TOKEN);

        let oauth_prefix = format!("oauth:{TOKEN}");
        assert_eq!(normalize_token(&oauth_prefix).unwrap(), TOKEN);

        let header_prefix = format!("OAuth {TOKEN}");
        assert_eq!(normalize_token(&header_prefix).unwrap(), TOKEN);
    }

    #[test]
    fn rejects_invalid_tokens() {
        assert!(normalize_token("abc defghijklmnopqrstuvwxyz0123").is_err());
        assert!(normalize_token("abc\ndefghijklmnopqrstuvwxyz0123").is_err());
        assert!(normalize_token("short").is_err());
    }

    #[test]
    fn inserts_and_replaces_only_the_managed_block() {
        let first = upsert_managed_block("player=mpv\n", TOKEN);
        assert!(first.starts_with("player=mpv\n\n"));
        assert!(first.contains(TOKEN));

        let replaced = upsert_managed_block(&first, OTHER_TOKEN);
        assert!(replaced.contains("player=mpv"));
        assert!(!replaced.contains(TOKEN));
        assert!(replaced.contains(OTHER_TOKEN));
        assert_eq!(replaced.matches(MANAGED_BEGIN).count(), 1);
        assert_eq!(replaced.matches(MANAGED_END).count(), 1);
    }

    #[test]
    fn removes_managed_block_without_touching_user_config() {
        let existing = concat!(
            "player=mpv\n\n",
            "# BEGIN streamlink-twitch-gui managed Twitch auth\n",
            "twitch-api-header=Authorization=OAuth token\n",
            "# END streamlink-twitch-gui managed Twitch auth\n\n",
            "retry-streams=1\n",
        );
        let cleaned = remove_managed_block(existing);
        assert_eq!(cleaned, "player=mpv\n\nretry-streams=1\n");
    }

    #[test]
    fn resolves_platform_config_paths() {
        let windows = HashMap::from([(
            "APPDATA",
            r"C:\Users\Janik\AppData\Roaming",
        )]);
        let windows_path = streamlink_config_path_for("windows", |key| {
            windows.get(key).map(|value| value.to_string())
        })
        .unwrap();
        let expected_windows = PathBuf::from(
            r"C:\Users\Janik\AppData\Roaming",
        )
        .join("streamlink")
        .join("config.twitch");
        assert_eq!(windows_path, expected_windows);

        let linux = HashMap::from([("HOME", "/home/janik")]);
        let linux_path = streamlink_config_path_for("linux", |key| {
            linux.get(key).map(|value| value.to_string())
        })
        .unwrap();
        let expected_linux = PathBuf::from(
            "/home/janik/.config/streamlink/config.twitch",
        );
        assert_eq!(linux_path, expected_linux);
    }
}
