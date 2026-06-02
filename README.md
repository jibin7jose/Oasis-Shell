<div align="center">
  <img src="https://raw.githubusercontent.com/jibin7jose/Oasis-Shell/main/public/Screenshot%202026-06-02%20222403.png" alt="Oasis Shell Interface" width="800" />
  
  <br/>
  <br/>

  <h1>🌌 Oasis-Shell Sentient OS</h1>
  <p><strong>An autonomous, AI-driven digital workspace powered by Rust & React</strong></p>

  <p>
    <a href="https://github.com/tauri-apps/tauri"><img src="https://img.shields.io/badge/Tauri-FFC13B?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
    <a href="https://ollama.ai/"><img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" /></a>
  </p>
</div>

<hr/>

## 🔮 What is Oasis-Shell?

Oasis-Shell is not just a terminal or a dashboard—it is a **Sentient Operating System layer**. Built with a lightning-fast Rust backend (Tauri) and a beautiful React/Tailwind frontend, it acts as an autonomous digital assistant that watches your screen, manages your code, and interacts with you via natural language and voice commands.

## 🚀 Key Features

### 🧠 Photographic Memory Engine
The OS runs a silent background agent in Rust that takes a snapshot of your screen every 30 seconds. It uses a local `llava` vision model to analyze the screen, extracting context about what you're working on. 
- **Time-Machine UI:** Browse a chronological timeline of your visual history.
- **Neural Querying:** Ask *"What was I working on earlier?"* and the OS will query its SQLite memory bank to answer factually.

### 🎙️ Voice Command Engine
A fully integrated Web Speech API pipeline allows hands-free control of your OS.
- Just say **"Review code and push"**, and the system will automatically run `git status`, generate a commit message using AI, and push your code to GitHub.
- Trigger complex deployments or memory recalls without touching your keyboard.

### 🤖 Proactive AI Agents (Cron Workers)
Deploy autonomous agents with custom prompts that run on a schedule.
- E.g. *"Check if CPU usage is over 80%. If yes, warn me."*
- Agents execute silently in the background and surface alerts only when necessary.

### 🌐 3D Strategic Cortex
A visual force-directed graph (powered by `react-force-graph-3d`) that maps out your strategic objectives, context crates, and system modules in an interactive 3D space.

### 📦 Context Crates (Workspaces)
Group applications, files, and tasks into isolated "Crates". Switch contexts instantly (e.g., from *Creative Forge* to *Strategic Core*) with a single click.

---

## 🏗️ Architecture & Stack

```mermaid
graph TD;
    A[React / Vite Frontend] -->|Tauri IPC| B(Rust Core Kernel);
    B -->|System APIs| C[Windows OS];
    B -->|Screen Capture| D[screenshots Crate];
    B -->|Vision Inference| E[Ollama / Llava];
    B -->|Text Inference| F[Ollama / Gemma4];
    B -->|Persistence| G[(SQLite DB)];
    
    A -->|Voice Capture| H[Web Speech API];
    H -->|Intent| A;
```

### Tech Stack Highlights:
- **Frontend:** React, TypeScript, TailwindCSS, Framer Motion, Lucide Icons, ForceGraph3D.
- **Backend:** Rust, Tauri, rusqlite, reqwest, image processing (v0.25).
- **AI / LLMs:** Local Ollama running `llava` (Vision) and `gemma4` (Text/Agents).

---

## ⚙️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/), [Rust](https://www.rust-lang.org/tools/install), and [Ollama](https://ollama.ai/) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jibin7jose/Oasis-Shell.git
   cd Oasis-Shell
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Pull required Local LLMs:**
   ```bash
   ollama pull gemma4:latest
   ollama pull llava
   ```

4. **Run the OS:**
   ```bash
   npm run dev
   ```

*(Note: The project uses a custom `.cargo/config.toml` to redirect build artifacts to `C:\dev\cargo-target` to bypass strict Windows AppLocker/Smart App Control policies.)*

---

## 📸 The Interface

The user interface features a premium glass-morphic aesthetic, designed to feel like a high-tech command center. 

- **Dark Mode Native:** Deep slate and indigo palettes.
- **Animated Substrates:** Glowing background auras that change color based on your active context.
- **Data-Dense Metrics:** Real-time RAM, CPU, and Runway metrics beautifully formatted.

<br/>

<div align="center">
  <i>"The future of computing is autonomous."</i>
</div>
