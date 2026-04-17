import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SpectralBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Spectral Breach Detected:', error, errorInfo);
  }

  private handleReconstruction = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900/50 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-8 text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
            <ShieldAlert className="w-16 h-16 text-rose-500 relative animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {this.props.fallbackTitle || 'Neural Manifold Breach'}
            </h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              A spectral anomaly has destabilized this compartment. 
              The Oasis Kernel has isolated the breach to protect systemic integrity.
            </p>
          </div>

          <div className="bg-black/40 border border-slate-800 rounded-lg p-3 w-full max-w-md overflow-hidden">
             <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Error Metadata</span>
             </div>
             <p className="text-[11px] font-mono text-rose-400/80 break-all text-left">
                {this.state.error?.message || 'Unknown Entropy Surge'}
             </p>
          </div>

          <button
            onClick={this.handleReconstruction}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-full text-rose-400 text-sm font-medium transition-all group active:scale-95"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Initiate Neural Reconstruction
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
