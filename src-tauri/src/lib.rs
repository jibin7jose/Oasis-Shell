pub mod models;
use models::*;
mod commands;

use std::sync::Mutex;
use tauri::Emitter;
use tauri::Manager;

use r2d2_sqlite::SqliteConnectionManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let manager = SqliteConnectionManager::file("oasis_crates.db");
    let pool = r2d2::Pool::new(manager).expect("Failed to create r2d2 pool");

    let conn = pool.get().expect("failed to get connection from pool");

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

    conn.execute(
        "CREATE TABLE IF NOT EXISTS priority_audit (
            id INTEGER PRIMARY KEY,
            pid INTEGER NOT NULL,
            name TEXT NOT NULL,
            priority TEXT NOT NULL,
            source TEXT NOT NULL,
            time INTEGER NOT NULL
        )",
        [],
    )
    .expect("failed to create priority audit table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS priority_cache (
            name TEXT PRIMARY KEY,
            priority TEXT NOT NULL,
            source TEXT NOT NULL,
            last_applied INTEGER NOT NULL,
            ignore BOOLEAN NOT NULL DEFAULT 0,
            ttl_days INTEGER NOT NULL DEFAULT 7
        )",
        [],
    )
    .expect("failed to create priority cache table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS clipboard_history (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )",
        [],
    )
    .expect("failed to create clipboard history table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS app_usage_analytics (
            id INTEGER PRIMARY KEY,
            exe_name TEXT NOT NULL,
            window_title TEXT NOT NULL,
            focus_time_seconds INTEGER NOT NULL DEFAULT 0,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(exe_name)
        )",
        [],
    )
    .expect("failed to create app usage table");

    let pool_for_clipboard = pool.clone();
    std::thread::spawn(move || {
        if let Ok(mut clipboard) = arboard::Clipboard::new() {
            let mut last_content = String::new();
            loop {
                std::thread::sleep(std::time::Duration::from_millis(1000));
                if let Ok(content) = clipboard.get_text() {
                    let trimmed = content.trim();
                    if !trimmed.is_empty() && content != last_content {
                        last_content = content.clone();
                        let ts = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs() as i64;
                        if let Ok(conn_clip) = pool_for_clipboard.get() {
                            // Keep only last 100 items
                            let _ = conn_clip.execute(
                                "INSERT INTO clipboard_history (content, type, timestamp) VALUES (?1, 'text', ?2)",
                                rusqlite::params![content, ts],
                            );
                            let _ = conn_clip.execute(
                                "DELETE FROM clipboard_history WHERE id NOT IN (SELECT id FROM clipboard_history ORDER BY timestamp DESC LIMIT 100)",
                                [],
                            );
                        }
                    }
                }
            }
        }
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .manage(DbState(pool))
        .manage(TelemetryState(Mutex::new(sysinfo::System::new_all())))
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                let _ = window.hide();
                api.prevent_close();
            }
            _ => {}
        })
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
                            let _ = if window.is_visible().unwrap_or(false) {
                                window.hide()
                            } else {
                                window.show().and_then(|_| window.set_focus())
                            };
                        }
                    }
                    tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Right,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } => {
                        tray.app_handle().exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            crate::commands::telemetry::start_telemetry_stream(app.handle().clone());
            let _ = crate::commands::golems::start_swarm_daemon(app.handle().clone());
            crate::commands::ai::start_semantic_vault_watcher(
                app.handle().clone(),
                app.state::<DbState>().clone(),
            );

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
                                // Toggle shortcut
                                let _ = if window.is_visible().unwrap_or(false) {
                                    window.hide()
                                } else {
                                    window.show().and_then(|_| window.set_focus())
                                };
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
            commands::telemetry::get_process_list,
            commands::telemetry::log_priority_audit,
            commands::telemetry::get_priority_audit,
            commands::telemetry::get_priority_cache,
            commands::telemetry::set_priority_cache_entry,
            commands::telemetry::remove_priority_cache_entry,
            commands::telemetry::clear_priority_cache,
            commands::telemetry::kill_process,
            commands::telemetry::suspend_process,
            commands::telemetry::resume_process,
            commands::telemetry::set_process_priority,
            commands::telemetry::get_hardware_telemetry,
            commands::telemetry::start_telemetry_server,
            commands::telemetry::get_clipboard_history,
            commands::telemetry::write_to_clipboard,
            commands::telemetry::start_voice_engine,
            commands::telemetry::start_cron_scheduler,
            commands::telemetry::get_app_usage_analytics,
            commands::telemetry::organize_workspace,
            commands::telemetry::execute_neural_macro,
            commands::telemetry::capture_screen,
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
            commands::ai::execute_cli_directive,
            commands::ai::generate_commit_message,
            commands::ai::analyze_terminal_error,
            commands::ai::check_ai_status,
            commands::ai::parse_neural_intent,
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
            commands::golems::hatch_autonomous_golem,
            commands::golems::decommission_golem,
            commands::golems::invoke_golem_debate,
            commands::golems::spawn_anomaly,
            commands::golems::start_swarm_daemon,
            commands::nexus::get_vault_nodes,
            commands::nexus::import_strategic_asset,
            commands::nexus::delete_strategic_asset,
            commands::nexus::access_strategic_asset,
            commands::nexus::recover_strategic_asset,
            commands::nexus::get_market_intelligence,
            commands::files::read_directory,
            commands::files::launch_path,
            commands::files::delete_path,
            commands::files::rename_path,
            commands::files::read_file_text
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
