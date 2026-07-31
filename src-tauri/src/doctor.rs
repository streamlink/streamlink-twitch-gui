use serde::Serialize;
use std::path::{Path, PathBuf};
use std::process::Command;

const MIN_STREAMLINK_VERSION: &str = "8.0.0";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolStatus {
    pub found: bool,
    pub path: Option<String>,
    pub version: Option<String>,
    pub source: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DoctorReport {
    pub streamlink: ToolStatus,
    pub mpv: ToolStatus,
    pub chatterino: ToolStatus,
    pub min_streamlink_version: String,
}

/// Find the first executable matching any of `names` on PATH.
pub fn which_on_path(names: &[&str]) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        for name in names {
            let candidate = dir.join(name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

/// Merge Machine + User PATH from the registry into this process.
/// Needed after winget/msi installs while the app is still running.
#[cfg(windows)]
fn refresh_path_from_registry() {
    use std::ffi::OsString;
    let machine = read_reg_path(
        r"HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
        "Path",
    );
    let user = read_reg_path(r"HKEY_CURRENT_USER\Environment", "Path");
    let mut parts: Vec<OsString> = Vec::new();
    for value in [machine, user].into_iter().flatten() {
        for dir in std::env::split_paths(&value) {
            if !dir.as_os_str().is_empty() {
                parts.push(dir.into_os_string());
            }
        }
    }
    if parts.is_empty() {
        return;
    }
    let Ok(mut merged) = std::env::join_paths(&parts) else {
        return;
    };
    if let Some(existing) = std::env::var_os("PATH") {
        let reg = std::env::split_paths(&merged).collect::<Vec<_>>();
        let mut all = reg;
        for dir in std::env::split_paths(&existing) {
            if !all.iter().any(|r| r == &dir) {
                all.push(dir);
            }
        }
        if let Ok(j) = std::env::join_paths(all) {
            merged = j;
        }
    }
    std::env::set_var("PATH", merged);
}

#[cfg(windows)]
fn read_reg_path(key: &str, value: &str) -> Option<std::ffi::OsString> {
    let output = Command::new("reg")
        .args(["query", key, "/v", value])
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let text = String::from_utf8_lossy(&output.stdout);
    // REG_EXPAND_SZ / REG_SZ lines look like: `    Path    REG_SZ    C:\...`
    for line in text.lines() {
        let line = line.trim();
        let lower = line.to_ascii_lowercase();
        if !lower.starts_with("path") && !lower.starts_with(&value.to_ascii_lowercase()) {
            continue;
        }
        let mut parts = line.split_whitespace();
        let _name = parts.next()?;
        let kind = parts.next()?.to_ascii_uppercase();
        if !kind.starts_with("REG_") {
            continue;
        }
        let data = parts.collect::<Vec<_>>().join(" ");
        if data.is_empty() {
            return None;
        }
        return Some(std::ffi::OsString::from(expand_env_vars(&data)));
    }
    None
}

#[cfg(windows)]
fn expand_env_vars(input: &str) -> String {
    let mut out = String::new();
    let mut rest = input;
    while let Some(start) = rest.find('%') {
        out.push_str(&rest[..start]);
        rest = &rest[start + 1..];
        if let Some(end) = rest.find('%') {
            let name = &rest[..end];
            if name.is_empty() {
                out.push('%');
            } else if let Ok(val) = std::env::var(name) {
                out.push_str(&val);
            } else {
                out.push('%');
                out.push_str(name);
                out.push('%');
            }
            rest = &rest[end + 1..];
        } else {
            out.push('%');
            out.push_str(rest);
            return out;
        }
    }
    out.push_str(rest);
    out
}

#[cfg(not(windows))]
fn refresh_path_from_registry() {}

fn streamlink_fallbacks() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            paths.push(dir.join("streamlink").join("streamlinkw.exe"));
            paths.push(
                dir.join("resources")
                    .join("streamlink")
                    .join("streamlinkw.exe"),
            );
        }
    }
    for env in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Ok(root) = std::env::var(env) {
            paths.push(
                PathBuf::from(root)
                    .join("Streamlink")
                    .join("bin")
                    .join("streamlinkw.exe"),
            );
        }
    }
    paths
}

fn mpv_fallbacks() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    for env in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Ok(root) = std::env::var(env) {
            // Classic layout
            paths.push(PathBuf::from(&root).join("mpv").join("mpv.exe"));
            // winget shinchiro.mpv Inno installer ("MPV Player")
            paths.push(PathBuf::from(&root).join("MPV Player").join("mpv.exe"));
        }
    }
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        let local = PathBuf::from(local);
        // winget shim / links directory
        paths.push(
            local
                .join("Microsoft")
                .join("WinGet")
                .join("Links")
                .join("mpv.exe"),
        );
        // Common user install roots
        paths.push(local.join("Programs").join("mpv").join("mpv.exe"));
        paths.push(local.join("Programs").join("MPV Player").join("mpv.exe"));
    }
    if let Ok(user) = std::env::var("USERPROFILE") {
        let user = PathBuf::from(user);
        paths.push(
            user.join("scoop")
                .join("apps")
                .join("mpv")
                .join("current")
                .join("mpv.exe"),
        );
        paths.push(user.join("scoop").join("shims").join("mpv.exe"));
    }
    paths
}

fn chatterino_fallbacks() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    // Prefer Chatterino7 (SevenTV fork) over stock Chatterino 2.
    // Prefer real installs first — WinGet Links shims often fail when spawned from a GUI host.
    for env in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Ok(root) = std::env::var(env) {
            let root = PathBuf::from(root);
            paths.push(root.join("Chatterino7").join("chatterino.exe"));
            paths.push(root.join("Chatterino").join("chatterino.exe"));
        }
    }
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        let local = PathBuf::from(local);
        paths.push(
            local
                .join("Programs")
                .join("Chatterino7")
                .join("chatterino.exe"),
        );
        paths.push(local.join("Chatterino7").join("chatterino.exe"));
        paths.push(
            local
                .join("Programs")
                .join("Chatterino")
                .join("chatterino.exe"),
        );
        paths.push(local.join("Chatterino").join("chatterino.exe"));
    }
    if let Ok(user) = std::env::var("USERPROFILE") {
        let user = PathBuf::from(user);
        for app in ["chatterino7", "chatterino"] {
            paths.push(
                user.join("scoop")
                    .join("apps")
                    .join(app)
                    .join("current")
                    .join("chatterino.exe"),
            );
        }
        paths.push(user.join("scoop").join("shims").join("chatterino.exe"));
    }
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        paths.push(
            PathBuf::from(local)
                .join("Microsoft")
                .join("WinGet")
                .join("Links")
                .join("chatterino.exe"),
        );
    }
    paths
}

fn first_existing(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates.iter().find(|p| p.is_file()).cloned()
}

/// Fast path lookup without spawning `--version` (used during stream start).
pub fn find_tool_path(path_names: &[&str], fallbacks: Vec<PathBuf>) -> Option<PathBuf> {
    which_on_path(path_names).or_else(|| first_existing(&fallbacks))
}

pub fn find_mpv_path() -> Option<PathBuf> {
    find_tool_path(&["mpv.exe", "mpv"], mpv_fallbacks())
}

pub fn find_chatterino_path() -> Option<PathBuf> {
    // Fallbacks first (real install), PATH last (often a WinGet shim).
    first_existing(&chatterino_fallbacks())
        .or_else(|| which_on_path(&["chatterino.exe", "chatterino"]))
}

pub fn find_streamlink_path() -> Option<PathBuf> {
    find_tool_path(
        &["streamlinkw.exe", "streamlink.exe", "streamlink"],
        streamlink_fallbacks(),
    )
}

fn read_version(exec: &Path, args: &[&str]) -> Option<String> {
    if args.is_empty() {
        return None;
    }
    let output = Command::new(exec).args(args).output().ok()?;
    let text = String::from_utf8_lossy(&output.stdout);
    let line = text.lines().next().unwrap_or("").trim();
    if line.is_empty() {
        return None;
    }
    // streamlink output: "streamlink 8.4.0" or "streamlinkw.exe 8.4.0"
    let version = line
        .split_whitespace()
        .find(|part| part.chars().next().is_some_and(|c| c.is_ascii_digit()))
        .unwrap_or(line);
    Some(version.to_string())
}

fn resolve_tool(path_names: &[&str], fallbacks: Vec<PathBuf>, version_args: &[&str]) -> ToolStatus {
    let path = which_on_path(path_names).or_else(|| first_existing(&fallbacks));
    match path {
        Some(p) => ToolStatus {
            found: true,
            version: read_version(&p, version_args),
            path: Some(p.to_string_lossy().to_string()),
            source: Some("system".into()),
        },
        None => ToolStatus {
            found: false,
            path: None,
            version: None,
            source: None,
        },
    }
}

pub fn run_doctor() -> DoctorReport {
    refresh_path_from_registry();

    let mut streamlink = resolve_tool(
        &["streamlinkw.exe", "streamlink.exe", "streamlink"],
        streamlink_fallbacks(),
        &["--version"],
    );
    // Prefer labeling bundled when under app resources.
    if let Some(path) = streamlink.path.as_deref() {
        if path.contains("resources\\streamlink") || path.contains("resources/streamlink") {
            streamlink.source = Some("bundled".into());
        }
    }

    DoctorReport {
        streamlink,
        mpv: resolve_tool(&["mpv.exe", "mpv"], mpv_fallbacks(), &["--version"]),
        chatterino: resolve_tool(
            &["chatterino.exe", "chatterino"],
            chatterino_fallbacks(),
            // Chatterino has no reliable --version; probing can crash/hang the GUI app.
            &[],
        ),
        min_streamlink_version: MIN_STREAMLINK_VERSION.into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn doctor_report_has_min_version() {
        let report = run_doctor();
        assert_eq!(report.min_streamlink_version, "8.0.0");
    }

    #[test]
    fn mpv_fallbacks_include_winget_mpv_player() {
        let paths = mpv_fallbacks();
        assert!(
            paths.iter().any(|p| {
                p.to_string_lossy()
                    .replace('/', "\\")
                    .ends_with("MPV Player\\mpv.exe")
            }),
            "expected winget 'MPV Player' install path in fallbacks: {paths:?}"
        );
    }

    #[cfg(windows)]
    #[test]
    fn doctor_finds_installed_mpv_when_present() {
        let winget = PathBuf::from(r"C:\Program Files\MPV Player\mpv.exe");
        if !winget.is_file() {
            return;
        }
        // Some CI shells don't export ProgramFiles; the fallbacks rely on it.
        if std::env::var("ProgramFiles").is_err() {
            return;
        }
        let report = run_doctor();
        assert!(
            report.mpv.found,
            "doctor should find winget mpv at {}",
            winget.display()
        );
    }
}
