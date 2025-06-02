import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const categories = [
  {
    icon: '🔧',
    title: 'Motor',
    description: 'Filtros, aceites, bujías y más',
  },
  {
    icon: '🚦',
    title: 'Frenos',
    description: 'Pastillas, discos y componentes',
  },
  {
    icon: '🛠️',
    title: 'Suspensión y Dirección',
    description: 'Amortiguadores y componentes',
  },
  {
    icon: '💡',
    title: 'Eléctrico',
    description: 'Baterías y componentes eléctricos',
  },
  {
    icon: '🚗',
    title: 'Transmisión',
    description: 'Embragues, convertidores de par, filtros de transmisión',
  },
  {
    icon: '🥶',
    title: 'Sistema de enfriamiento',
    description: 'Radiadores, Termostatos, Mangueras',
  },
];

function Home() {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Bienvenido a Refaccionaria</h1>
          <p className="hero-subtitle">Tu solución completa en refacciones automotrices</p>

          {!user && (
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-secondary">
                Registrarse
              </Link>
            </div>
          )}
        </div>

       

        {/* Contact Section */}
        
      </div>

      <footer className="footer">
        <div className="footer-content">
          <h2>Dementes</h2>
          <p>Correo: <a href="mailto:Dementes@gmail.com">Dementes@gmail.com</a></p>
          <p className="copyright">&copy; 2025 Dementes. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
