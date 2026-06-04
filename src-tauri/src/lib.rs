pub mod models;
use models::*;
mod commands;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Emitter;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = Connection::open("oasis_crates.db").expect("failed to open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS context_crates (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            apps TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )",
        [],
    )
    .expect("failed to create table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS neural_logs (
            id INTEGER PRIMARY KEY,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )",
        [],
    )
    .expect("failed to create logs table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS resume_analysis (
            id INTEGER PRIMARY KEY,
            role TEXT NOT NULL,
            match_score INTEGER NOT NULL,
            timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )",
        [],
    )
    .expect("failed to create resume analysis table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS file_embeddings (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            content TEXT NOT NULL,
            vector TEXT NOT NULL
        )",
        [],
    )
    .expect("failed to create vector table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS photographic_memory (
            id INTEGER PRIMARY KEY,
            timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            description TEXT NOT NULL
        )",
        [],
    )
    .expect("failed to create photographic memory table");
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(DbState(Mutex::new(conn)))
        .manage(TelemetryState(Mutex::new(sysinfo::System::new_all())))
        .setup(|app| {
            tauri::tray::TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Oasis Sentient OS")
                .on_tray_icon_event(|tray, event| match event {
                    tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } => {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show().and_then(|_| window.set_focus());
                        }
                    }
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("CommandOrControl+Shift+Space")
                .expect("failed to register shortcut")
                .with_shortcut("CommandOrControl+`")
                .expect("failed to register terminal shortcut")
                .with_shortcut("CommandOrControl+Space")
                .expect("failed to register command palette shortcut")
                .with_handler(|app, shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            if shortcut.matches(
                                tauri_plugin_global_shortcut::Modifiers::CONTROL
                                    | tauri_plugin_global_shortcut::Modifiers::META
                                    | tauri_plugin_global_shortcut::Modifiers::SHIFT,
                                tauri_plugin_global_shortcut::Code::Space,
                            ) {
                                let _ = if window.is_visible().unwrap_or(false) {
                                    window.hide()
                                } else {
                                    window.show().and_then(|_| window.set_focus())
                                };
                            } else if shortcut.matches(
                                tauri_plugin_global_shortcut::Modifiers::CONTROL
                                    | tauri_plugin_global_shortcut::Modifiers::META,
                                tauri_plugin_global_shortcut::Code::Space,
                            ) {
                                // Command Palette shortcut
                                let _ = window.show().and_then(|_| window.set_focus());
                                let _ = window.emit("toggle-command-palette", ());
                            } else {
                                // Terminal shortcut
                                let _ = window.show().and_then(|_| window.set_focus());
                                let _ = window.emit("toggle-sentient-terminal", ());
                            }
                        }
                    }
                })
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::widget::set_widget_mode,
            commands::telemetry::get_running_windows,
            commands::telemetry::get_hardware_telemetry,
            commands::telemetry::start_telemetry_server,
            commands::crates::sync_project,
            commands::crates::save_crate,
            commands::crates::update_crate,
            commands::crates::get_crates,

            commands::crates::delete_crate,
            commands::crates::start_watcher,
            commands::crates::launch_crate,
            commands::nexus::log_event,
            commands::nexus::get_logs,
            commands::nexus::get_nearby_projects,
            commands::nexus::get_neuroforge_profile,
            commands::nexus::get_nexus_health,
            commands::nexus::save_resume_analysis,
            commands::nexus::get_latest_resume_analysis,
            commands::ai::index_folder,
            commands::ai::semantic_search,
            commands::ai::rag_query,
            commands::nexus::get_neural_graph,
            commands::nexus::get_all_files,

            commands::crates::generate_crate_name,
            commands::ai::execute_neural_command,
            commands::ai::generate_commit_message,
            commands::ai::check_ai_status,
            commands::nexus::start_proactive_sentience,
            commands::vision::start_photographic_memory,
            commands::vision::query_photographic_memory,
            commands::vision::get_all_photographic_memories,
            commands::nexus::sync_hardware_aura,
            commands::vision::capture_screenshot,
            commands::vision::query_vision,
            commands::nexus::get_logic_path,
            commands::nexus::get_venture_metrics,
            commands::nexus::trigger_deploy,
            commands::golems::get_active_golems,
            commands::golems::get_golem_proposals,
            commands::golems::get_neural_workforce,
            commands::golems::execute_golem_manifest,
            commands::golems::resolve_golem_proposal,
            commands::nexus::get_vault_nodes,
            commands::nexus::get_market_intelligence
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
