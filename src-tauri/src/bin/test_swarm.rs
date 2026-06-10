use reqwest::Client;
use serde_json::Value;
use std::fs;
use std::process::Command;
use std::time::SystemTime;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Autonomous Swarm Agent Test ===");
    println!("Spawning test agent: 'FileSystem_Sweeper'...");

    let client = Client::new();
    let mission = "Your mission is to output a single powershell command to create a file called 'swarm_test_result.txt' in the '../test_results' directory containing the text 'Swarm Agent Successfully Executed'. Use the format: [CMD] your powershell command here [/CMD]. Do not include any other text in your response.";

    let system_prompt = format!(
        "You are an autonomous AI Agent named FileSystem_Sweeper. Your mission is: {}. You have full access to execute powershell commands on the user's system to accomplish this mission. To execute a command, output it strictly in this format: [CMD] your command [/CMD]. I will execute it and return the terminal output. Operate silently and efficiently. Output your thought process, then exactly one [CMD] block if an action is needed.", 
        mission
    );

    let chat_body = serde_json::json!({
        "model": "gemma4:latest",
        "prompt": system_prompt,
        "stream": false
    });

    println!("Agent is thinking...");

    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&chat_body)
        .send()
        .await?;
    let json: Value = res.json().await?;

    let response_text = json["response"].as_str().unwrap_or("");
    println!("\nAgent Thought Trace:\n{}\n", response_text);

    let mut success = false;
    let mut log_output = format!(
        "=== Swarm Agent Autonomous Test ===\nTimestamp: {:?}\n\nThought Trace:\n{}\n\n",
        SystemTime::now(),
        response_text
    );

    if let Some(start_idx) = response_text.find("[CMD]") {
        if let Some(end_idx) = response_text.find("[/CMD]") {
            if end_idx > start_idx + 5 {
                let cmd_str = response_text[start_idx + 5..end_idx].trim();
                println!("Agent Generated Command: {}", cmd_str);
                log_output.push_str(&format!("Executed Command:\n{}\n\n", cmd_str));

                let output = Command::new("powershell")
                    .args(["-NoProfile", "-NonInteractive", "-Command", cmd_str])
                    .output()?;

                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();

                println!("Command Stdout: {}", stdout);
                if !stderr.is_empty() {
                    println!("Command Stderr: {}", stderr);
                }

                log_output.push_str(&format!(
                    "Terminal Result:\nSTDOUT:\n{}\nSTDERR:\n{}\n",
                    stdout, stderr
                ));
                success = true;
            }
        }
    } else {
        println!("Error: Agent did not generate a [CMD] block.");
        log_output.push_str("Result: Failed to parse [CMD] block.\n");
    }

    // Ensure directory exists
    let _ = fs::create_dir_all("../test_results");

    if success {
        println!("Test completed. Verifying results...");
        log_output.push_str("\nTest Execution Successful.");
    }

    fs::write("../test_results/swarm_agent_log.txt", log_output)?;
    println!("\nTest log saved to ../test_results/swarm_agent_log.txt");

    Ok(())
}
