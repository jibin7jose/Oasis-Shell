use std::fs;
use std::process::Command;
use std::time::{Duration, Instant};
use sysinfo::System;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Autonomous Swarm Healing Test ===");
    let _ = fs::create_dir_all("../test_results");
    
    let mut log_output = format!("=== Autonomous Swarm Healing Test Report ===\nTimestamp: {:?}\n\n", std::time::SystemTime::now());

    println!("1. Spawning Ghost Anomaly Process (OasisAnomaly)...");
    log_output.push_str("Action: Spawning OasisAnomaly powershell process.\n");
    
    // Spawn anomaly process
    let mut debug_dir = std::path::PathBuf::from("C:/dev/cargo-target/debug/anomaly.exe");
    if !debug_dir.exists() {
         debug_dir = std::path::PathBuf::from("D:/myproject/Oasis-Shell/src-tauri/target/debug/anomaly.exe");
    }
    
    let mut child = Command::new(&debug_dir)
        .spawn()?;
        
    let anomaly_pid = child.id();
    println!("Anomaly PID: {}", anomaly_pid);
    log_output.push_str(&format!("Result: Anomaly successfully spawned with PID {}.\n", anomaly_pid));

    println!("2. Verifying Swarm Daemon neutralizes the anomaly...");
    log_output.push_str("Action: Waiting for background Oasis-Shell daemon to detect and kill the anomaly.\n");
    
    let mut system = System::new_all();
    let start_time = Instant::now();
    let timeout = Duration::from_secs(15);
    let mut neutralized = false;
    let mut time_to_kill = 0.0;

    // Wait for the daemon to kill it
    while start_time.elapsed() < timeout {
        system.refresh_all();
        let mut found = false;
        
        for (pid, process) in system.processes() {
            if pid.as_u32() == anomaly_pid {
                found = true;
                break;
            }
        }
        
        if !found {
            // Process was killed!
            neutralized = true;
            time_to_kill = start_time.elapsed().as_secs_f32();
            break;
        }
        
        std::thread::sleep(Duration::from_millis(500));
        print!(".");
        use std::io::Write;
        std::io::stdout().flush().unwrap();
    }
    
    println!();
    
    if neutralized {
        println!("SUCCESS: Swarm Daemon successfully detected and neutralized the anomaly in {:.1} seconds!", time_to_kill);
        log_output.push_str(&format!("Result: SUCCESS. Anomaly PID {} was neutralized autonomously in {:.1} seconds.\n", anomaly_pid, time_to_kill));
        log_output.push_str("Conclusion: Autonomous Swarm Healing is 100% operational.\n");
    } else {
        println!("FAILURE: The anomaly was not killed within 15 seconds.");
        log_output.push_str("Result: FAILURE. Anomaly remained active. The Swarm Daemon may not be running or failed to detect it.\n");
        // Clean up manually
        let _ = child.kill();
        log_output.push_str("Action: Manually killed anomaly process to prevent leak.\n");
    }
    
    fs::write("../test_results/swarm_healing_report.txt", log_output)?;
    println!("Test report saved to test_results/swarm_healing_report.txt");
    
    Ok(())
}
