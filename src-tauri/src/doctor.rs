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

fn which_on_path(names: &[&str]) -> Option<PathBuf> {
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

fn streamlink_fallbacks() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            paths.push(dir.join("streamlink").join("streamlinkw.exe"));
            paths.push(dir.join("resources").join("streamlink").join("streamlinkw.exe"));
        }
    }
    for env in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Ok(root) = std::env::var(env) {
            paths.push(PathBuf::from(root).join("Streamlink").join("bin").join("streamlinkw.exe"));
        }
    }
    paths
}

fn mpv_fallbacks() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    for env in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Ok(root) = std::env::var(env) {
            paths.push(PathBuf::from(root).join("mpv").join("mpv.exe"));
        }
    }
    paths
}

fn chatterino_fallbacks() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        paths.push(PathBuf::from(local).join("Chatterino").join("chatterino.exe"));
    }
    for env in ["ProgramFiles", "ProgramFiles(x86)"] {
        if let Ok(root) = std::env::var(env) {
            paths.push(PathBuf::from(root).join("Chatterino").join("chatterino.exe"));
        }
    }
    paths
}

fn first_existing(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates.iter().find(|p| p.is_file()).cloned()
}

fn read_version(exec: &Path, args: &[&str]) -> Option<String> {
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
    let mut streamlink = resolve_tool(
        &["streamlinkw.exe", "streamlink.exe", "streamlink"],
        streamlink_fallbacks(),
        &["--version"],
    );
    if streamlink.found {
        if let Some(path) = &streamlink.path {
            if path.contains("resources") || path.contains(std::path::MAIN_SEPARATOR) {
                // Prefer labeling bundled when under app resources
                if path.contains("resources\\streamlink") || path.contains("resources/streamlink") {
                    streamlink.source = Some("bundled".into());
                }
            }
        }
    }

    DoctorReport {
        streamlink,
        mpv: resolve_tool(&["mpv.exe", "mpv"], mpv_fallbacks(), &["--version"]),
        chatterino: resolve_tool(
            &["chatterino.exe", "chatterino"],
            chatterino_fallbacks(),
            &["--version"],
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
}
