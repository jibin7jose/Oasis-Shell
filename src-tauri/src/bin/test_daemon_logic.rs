use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use sysinfo::System;

fn main() {
    println!("Testing daemon process detection...");
    
    let mut system = System::new_all();
    system.refresh_all();
    
    let mut found = false;
    for (pid, process) in system.processes() {
        let name = process.name().to_string_lossy().to_lowercase();
        if name == "anomaly.exe" || name == "anomaly" {
            println!("DETECTED: {} (PID: {})", name, pid);
            found = true;
        }
    }
    
    if !found {
        println!("No anomaly detected!");
    }
}
