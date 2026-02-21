import { Component, ErrorInfo, ReactNode } from "react";
import { pushError } from "@/lib/faro";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Error boundary component that catches React rendering errors
 * and reports them to Grafana Faro for observability.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Report error to Grafana Faro
    pushError(error, {
      componentStack: errorInfo.componentStack || "unknown",
      errorBoundary: "true",
    });

    // Also log to console for development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRefresh = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = (): void => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="font-sf-pro flex flex-col justify-center items-center min-h-screen bg-[#131213] text-center text-white p-4">
          <div className="text-2xl font-semibold mb-2">Something went wrong</div>

          <div className="text-base text-gray-300 mb-6 max-w-md">
            We encountered an unexpected error. This has been automatically reported to help us fix
            it.
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={this.handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>

            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>

          <button
            onClick={this.toggleDetails}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            {this.state.showDetails ? "Hide" : "Show"} Error Details
            {this.state.showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {this.state.showDetails && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg text-left text-sm text-gray-300 max-w-2xl w-full max-h-64 overflow-auto">
              <div className="font-semibold text-red-400 mb-2">
                {this.state.error?.name}: {this.state.error?.message}
              </div>
              <pre className="whitespace-pre-wrap text-xs text-gray-400">
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo?.componentStack && (
                <>
                  <div className="font-semibold text-gray-300 mt-4 mb-2">Component Stack:</div>
                  <pre className="whitespace-pre-wrap text-xs text-gray-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500 max-w-md">
            If this issue persists, please email{" "}
            <a
              href="mailto:support@tunele.app"
              className="underline text-blue-500 hover:text-blue-400 transition-colors"
            >
              support@tunele.app
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
