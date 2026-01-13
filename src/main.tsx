import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initAnalytics } from './lib/analytics'
import { initWebVitals } from './lib/webVitals'
import { initErrorTracking } from './lib/errorTracking'

// Initialize analytics, error tracking, and performance monitoring
initAnalytics();
initErrorTracking();
initWebVitals();

createRoot(document.getElementById("root")!).render(<App />);
