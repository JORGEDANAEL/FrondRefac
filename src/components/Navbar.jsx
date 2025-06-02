import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user ? "/dashboard" : "/"}>Refaccionaria</Link>
      </div>
      
      <div className="navbar-links">
        {user ? (
          // Usuario autenticado
          <div className="user-menu">
            <div className="dropdown">
              <button className="dropdown-toggle" onClick={toggleMenu}>
                <span className="username">Hola, {user.username}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/usuarios" className="dropdown-item">Empleados</Link>
                  <Link to="/proveedores" className="dropdown-item">Provedores</Link>
                  <Link to="/Stocks" className="dropdown-item">Stocks</Link>
                  <Link to="/ventas" className="dropdown-item">Carrito</Link>
                  <Link to="/tienda" className="dropdown-item">Tienda</Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Usuario no autenticado
          <>
            <Link to="/login" className="nav-link">Iniciar sesión</Link>
            <Link to="/register" className="nav-link">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar