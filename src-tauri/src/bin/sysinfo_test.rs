use sysinfo::System;

fn main() {
    let mut system = System::new_all();
    system.refresh_all();
    
    for (pid, process) in system.processes() {
        let name = process.name().to_string_lossy().to_lowercase();
        if name.contains("anomaly") {
            println!("Found anomaly! PID: {}, Name: {}", pid, name);
        }
    }
}
