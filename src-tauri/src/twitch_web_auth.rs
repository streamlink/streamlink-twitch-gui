#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn normalizes_supported_token_forms() {
        let token = "abcdefghijklmnopqrstuvwxyz0123";
        assert_eq!(normalize_token(token).unwrap(), token);
        assert_eq!(normalize_token(&format!("oauth:{token}")).unwrap(), token);
        assert_eq!(normalize_token(&format!("OAuth {token}")).unwrap(), token);
    }

    #[test]
    fn rejects_tokens_with_whitespace_or_control_characters() {
        assert!(normalize_token("abc defghijklmnopqrstuvwxyz0123").is_err());
        assert!(normalize_token("abc\ndefghijklmnopqrstuvwxyz0123").is_err());
        assert!(normalize_token("short").is_err());
    }

    #[test]
    fn inserts_and_replaces_only_the_managed_config_block() {
        let first = upsert_managed_block("player=mpv\n", "abcdefghijklmnopqrstuvwxyz0123");
        assert!(first.starts_with("player=mpv\n\n"));
        assert!(first.contains(
            "twitch-api-header=Authorization=OAuth abcdefghijklmnopqrstuvwxyz0123"
        ));

        let replaced = upsert_managed_block(&first, "zyxwvutsrqponmlkjihgfedcba3210");
        assert!(replaced.contains("player=mpv"));
        assert!(!replaced.contains("abcdefghijklmnopqrstuvwxyz0123"));
        assert_eq!(replaced.matches(MANAGED_BEGIN).count(), 1);
        assert_eq!(replaced.matches(MANAGED_END).count(), 1);
    }

    #[test]
    fn removes_managed_block_without_touching_user_config() {
        let existing = format!(
            "player=mpv\n\n{MANAGED_BEGIN}\ntwitch-api-header=Authorization=OAuth abcdefghijklmnopqrstuvwxyz0123\n{MANAGED_END}\n\nretry-streams=1\n"
        );
        assert_eq!(
            remove_managed_block(&existing),
            "player=mpv\n\nretry-streams=1\n"
        );
    }

    #[test]
    fn resolves_platform_config_paths_from_explicit_environment() {
        let windows = HashMap::from([("APPDATA", r"C:\Users\Janik\AppData\Roaming")]);
        let windows_path = streamlink_config_path_for("windows", |key| {
            windows.get(key).map(|value| value.to_string())
        })
        .unwrap();
        assert_eq!(
            windows_path,
            std::path::PathBuf::from(r"C:\Users\Janik\AppData\Roaming")
                .join("streamlink")
                .join("config.twitch")
        );

        let linux = HashMap::from([("HOME", "/home/janik")]);
        let linux_path = streamlink_config_path_for("linux", |key| {
            linux.get(key).map(|value| value.to_string())
        })
        .unwrap();
        assert_eq!(
            linux_path,
            std::path::PathBuf::from("/home/janik/.config/streamlink/config.twitch")
        );
    }
}
