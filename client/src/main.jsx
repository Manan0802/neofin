import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GlobalProvider } from './context/GlobalContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GlobalProvider>
  </React.StrictMode>,
)