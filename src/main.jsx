import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { MusicVolumeProvider } from "./context/MusicVolumeContext.jsx";
import { SfxVolumeProvider } from "./context/SfxVolumeContext";
import './i18n';
import './styles/index.css'
import "./styles/theme.scss";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <MusicVolumeProvider>
          <SfxVolumeProvider>
            <App />
          </SfxVolumeProvider>
        </MusicVolumeProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)