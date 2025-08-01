/********************************************************************
 *   src/main.tsx — canonical entry point for a Vite + React 18 app *
 ********************************************************************/
import React            from 'react'
import ReactDOM         from 'react-dom/client'   //  ←  you need this
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './contexts/Auth'     // if you created this
import App      from './App'
import Login    from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import POPage from './pages/po.tsx'

import './index.css'                            // Tailwind base + custom css

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Routes>
            <Route path="/"         element={<App       />} />
            <Route path="/login"    element={<Login     />} />
            <Route path="/register" element={<Register  />} />
            <Route path="/po"       element={<POPage    />} />
            <Route path="*"         element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
)
