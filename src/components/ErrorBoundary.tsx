import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Generic error boundary for graceful failure handling.
 * Catches runtime errors in React component tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    // Could send to error tracking service (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-8">
          <div className="glass-panel p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-white/70 mb-4">We encountered an unexpected error. Please try refreshing the page.</p>
            {this.state.error && (
              <pre className="text-xs text-white/50 bg-black/30 p-3 rounded-lg overflow-auto mb-4">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="glass-button-neon px-6 py-2"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
