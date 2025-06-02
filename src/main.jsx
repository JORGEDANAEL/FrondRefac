import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from './Layout.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Stocks from './pages/Stocks.jsx'
import Ventas from './pages/Ventas.jsx'
import Tienda from './pages/tienda.jsx'
import Proveedores from './pages/Proveedores.jsx'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route 
              path='/dashboard' 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/usuarios' 
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/stocks' 
              element={
                <ProtectedRoute>
                  <Stocks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/ventas' 
              element={
                <ProtectedRoute>
                  <Ventas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/tienda' 
              element={
                <ProtectedRoute>
                  <Tienda />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/proveedores' 
              element={
                <ProtectedRoute>
                  <Proveedores />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
