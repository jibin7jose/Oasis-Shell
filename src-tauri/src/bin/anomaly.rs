use std::thread;
use std::time::Duration;

fn main() {
    // This is a dummy process that does nothing but sleep.
    // It exists purely for the Swarm Daemon to detect and kill.
    loop {
        thread::sleep(Duration::from_secs(1));
    }
}
