use std::sync::Mutex;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};

pub struct DbState(pub Mutex<Connection>);
pub struct TelemetryState(pub Mutex<sysinfo::System>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ContextCrate {
    pub id: Option<i32>,
    pub name: String,
    pub timestamp: String,
    pub apps: String, // JSON string of applications
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NeuralLog {
    pub id: Option<i32>,
    pub event_type: String,
    pub message: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WindowInfo {
    pub title: String,
    pub pid: u32,
    pub exe_path: String,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub is_maximized: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub mem_usage: u64,
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HardwareTelemetry {
    pub cpu_usage: f32,
    pub ram_usage: f32,
    pub disk_usage: f32,
    pub network_up: f32,
    pub network_down: f32,
    pub gpu_usage: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MemoryEntry {
    pub id: i32,
    pub timestamp: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PriorityAuditLog {
    pub id: i32,
    pub pid: u32,
    pub name: String,
    pub priority: String,
    pub source: String,
    pub time: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PriorityCacheEntry {
    pub name: String,
    pub priority: String,
    pub source: String,
    pub lastApplied: u64,
    pub ignore: bool,
    pub ttlDays: u32,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub last_modified: i64,
}
