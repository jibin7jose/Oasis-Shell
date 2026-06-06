use crate::models::FileInfo;
use std::fs;
use std::path::Path;
use std::time::UNIX_EPOCH;

#[tauri::command]
pub fn read_directory(path: Option<String>) -> Result<Vec<FileInfo>, String> {
    let target_path = match path {
        Some(p) if !p.is_empty() => p,
        _ => {
            // Default to home directory
            dirs::home_dir()
                .map(|p| p.to_string_lossy().into_owned())
                .unwrap_or_else(|| "C:\\".to_string())
        }
    };

    let p = Path::new(&target_path);
    if !p.exists() || !p.is_dir() {
        return Err("Path does not exist or is not a directory".to_string());
    }

    let mut files = Vec::new();
    let entries = fs::read_dir(p).map_err(|e| e.to_string())?;

    for entry in entries.filter_map(Result::ok) {
        let meta = entry.metadata().ok();
        let name = entry.file_name().to_string_lossy().into_owned();
        let full_path = entry.path().to_string_lossy().into_owned();
        
        let is_dir = meta.as_ref().map(|m| m.is_dir()).unwrap_or(false);
        let size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
        let last_modified = meta
            .as_ref()
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        files.push(FileInfo {
            name,
            path: full_path,
            is_dir,
            size,
            last_modified,
        });
    }

    // Sort: Folders first, then files alphabetically
    files.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(files)
}

#[tauri::command]
pub fn launch_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn delete_path(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("Path does not exist".to_string());
    }

    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())?;
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn rename_path(path: String, newName: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err("Path does not exist".to_string());
    }

    let parent = p.parent().unwrap_or(Path::new(""));
    let new_path = parent.join(newName);

    fs::rename(p, new_path).map_err(|e| e.to_string())?;

    Ok(())
}
