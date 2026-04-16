/**
 * OASIS SHELL CONTRACTS
 * Shared types between the Rust backend and React frontend.
 */

export interface FounderMetrics {
  arr: string;
  burn: string;
  runway: string;
  momentum: string;
  stress_color: string;
}

export interface LatticePoint {
  label: string;
  x_pct: number;
  y_pct: number;
  intensity: number;
  category: "CODE" | "MARKET" | "SYSTEM" | "ERROR";
}

export interface SystemStats {
  oas_id: string;
  path_status: string;
  binary_sync: boolean;
  cpu_load: number;
  mem_used: number;
  battery_level: number;
  is_charging: boolean;
  battery_health: number;
  time_remaining_min: number;
}

export interface DeviceInfo {
  id: string;
  category: string;
  status: string;
  metadata: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  mem_usage: number;
  status: string;
}

export interface StorageInfo {
  name: string;
  mount: string;
  total: number;
  available: number;
  health_score: number;
}

export interface GolemTask {
  id: string;
  name: string;
  status: string;
  progress: number;
  aura: string; // emerald, amber, rose, indigo
}

export interface StrategicMacro {
  id: string;
  name: string;
  description: string;
  script: string;
  trigger_pattern: string;
  signed: boolean;
  aura: string;
  status: string;
}

export interface CollectiveNode {
  id: string;
  ip: string;
  port: number;
  hostname: string;
  status: "Active" | "Offline" | "Syncing";
  last_pulse: string;
  aura: string;
  latency_ms: number;
}

export interface ContextCrate {
  id?: number;
  name: string;
  description: string;
  aura_color: string;
  apps: string;
  timestamp: string;
}

export interface WindowInfo {
  title: string;
  pid: number;
  exe_path: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_maximized: boolean;
}

export interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  last_modified: number;
}
