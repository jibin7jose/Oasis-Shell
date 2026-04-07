import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-20 overflow-auto">
          <div className="max-w-4xl w-full glass-bright border border-rose-500/50 p-12 rounded-[3rem] text-rose-500">
            <h1 className="text-4xl font-black uppercase mb-6 tracking-tighter">Neural Core Execution Failure</h1>
            <pre className="bg-black/40 p-8 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap mb-8 text-rose-200">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </pre>
            <button onClick={() => window.location.reload()} className="px-10 py-4 bg-rose-600 text-white font-black uppercase rounded-2xl">Reboot Kernel</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
