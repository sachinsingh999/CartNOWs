import React, { Component } from "react";
import { RotateCcw, AlertTriangle, Home } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 select-none">
          <div className="p-4.5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-505 mb-5 animate-pulse border border-rose-100 dark:border-rose-900/30">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed font-medium">
            An unexpected error occurred while loading this section of the store. Our team has been notified.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button
              onClick={this.handleReset}
              className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-md hover:shadow-lg transition flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Retry Load</span>
            </button>
            <a
              href="/"
              className="px-4.5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-black uppercase tracking-wider border border-slate-200/50 dark:border-slate-800 cursor-pointer transition flex items-center gap-1.5 no-underline"
            >
              <Home size={12} />
              <span>Go Home</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
