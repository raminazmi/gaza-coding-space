import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root")!;
rootElement.setAttribute('dir', 'rtl');

const theme = localStorage.getItem('theme');
if (theme === 'dark' || theme === 'light') {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
} else {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add('light');
}

createRoot(rootElement).render(<App />);
