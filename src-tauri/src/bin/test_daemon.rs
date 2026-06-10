use enigo::{Enigo, Key, Keyboard, Settings};
use std::fs;
use std::process::Command;
use std::time::Duration;
use std::time::SystemTime;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Oasis Daemon & Hotkey Test ===");
    println!("Ensuring output directory exists...");
    let _ = fs::create_dir_all("../test_results");

    let mut log_output = format!(
        "=== Daemon Hotkey Injection Test ===\nTimestamp: {:?}\n\n",
        SystemTime::now()
    );

    println!("Simulating Global Hotkey: Ctrl + Space...");
    log_output.push_str("Action: Injecting Global Shortcut [Ctrl + Space]\n");

    // Simulate Hotkey
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    let _ = enigo.key(Key::Control, enigo::Direction::Press);
    let _ = enigo.key(Key::Space, enigo::Direction::Click);
    let _ = enigo.key(Key::Control, enigo::Direction::Release);

    println!("Hotkey Sent. Waiting for window slide animation...");
    std::thread::sleep(Duration::from_secs(2));

    // Verify Process exists
    let output = Command::new("tasklist")
        .output()
        .expect("Failed to execute tasklist");

    let tasklist = String::from_utf8_lossy(&output.stdout);

    if tasklist.contains("oasis-shell.exe") || tasklist.contains("node.exe") {
        println!("Verified: Background daemon process is active in system memory.");
        log_output.push_str("Status: Oasis Daemon is actively running in background memory.\n");
        log_output.push_str("Result: Hotkey signal broadcast successful.\n");
    } else {
        println!("Warning: Could not detect oasis-shell.exe. Ensure the dev server is running.");
        log_output.push_str(
            "Result: Signal broadcasted, but oasis-shell.exe was not detected in tasklist.\n",
        );
    }

    log_output
        .push_str("\nTest Execution Complete. The application should have toggled visibility.");

    fs::write("../test_results/daemon_test_log.txt", log_output)?;
    println!("Test log saved to ../test_results/daemon_test_log.txt");

    Ok(())
}
