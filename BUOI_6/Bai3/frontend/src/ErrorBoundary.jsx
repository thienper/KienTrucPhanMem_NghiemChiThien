import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px 20px',
                    background: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    margin: '20px',
                    color: '#721c24',
                    fontFamily: 'monospace'
                }}>
                    <h2>⚠️ Application Error</h2>
                    <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '12px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
