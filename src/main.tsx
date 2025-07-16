import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root")!;
rootElement.setAttribute('dir', 'rtl');
createRoot(rootElement).render(<App />);
