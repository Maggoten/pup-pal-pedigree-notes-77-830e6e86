
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Explicitly import CSS to ensure it's included in the build
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
