
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Explicitly import CSS with correct path to ensure it's included in the build
import './index.css'

// Log for debugging CSS loading
console.log('Main entry point loaded, CSS import attempted');

// Create root with strong typing
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found in document');

const root = createRoot(rootElement);

// Render the app with CSS applied
root.render(<App />);
