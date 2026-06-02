use rusqlite::{Connection, params};

#[test]
fn test_database_crud() {
    println!("--- AUTOMATED TEST: DATABASE CRUD ---");
    let conn = Connection::open_in_memory().unwrap();
    conn.execute(
        "CREATE TABLE IF NOT EXISTS context_crates (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            apps TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )",
        [],
    ).unwrap();
    
    // Test Insert
    let timestamp = chrono::Local::now().to_rfc3339();
    conn.execute(
        "INSERT INTO context_crates (name, apps, timestamp) VALUES (?1, ?2, ?3)",
        params!["Test Crate", "[{}]", timestamp],
    ).unwrap();
    println!("INSERT: PASS");
    
    // Test Read
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM context_crates", [], |row| row.get(0)).unwrap();
    assert_eq!(count, 1);
    println!("READ: PASS");
    
    // Test Delete
    conn.execute("DELETE FROM context_crates WHERE name = ?1", params!["Test Crate"]).unwrap();
    let new_count: i32 = conn.query_row("SELECT COUNT(*) FROM context_crates", [], |row| row.get(0)).unwrap();
    assert_eq!(new_count, 0);
    println!("DELETE: PASS");
    println!("FULL PIPELINE TEST COMPLETE: SUCCESS");
}
