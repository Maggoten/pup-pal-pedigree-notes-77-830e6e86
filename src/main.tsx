
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Explicitly import CSS with correct path to ensure it's included in the build
import './index.css'

// Log for debugging CSS loading
console.log('Main entry point loaded, CSS import attempted');

createRoot(document.getElementById("root")!).render(<App />);
