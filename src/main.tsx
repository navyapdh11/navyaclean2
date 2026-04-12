import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import Scene3D from './components/Scene3D'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <div className="relative min-h-screen">
      {/* 3D Background Canvas */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Scene3D />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <App />
      </div>
    </div>
  </ErrorBoundary>
)
