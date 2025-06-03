import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

const API_URL = 'https://backendref.onrender.com/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalRefacciones: 0,
    totalStock: 0,
    totalUsuarios: 0,
    totalVentas: 0,
    categorias: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar refacciones
        const refaccionesResponse = await fetch(`${API_URL}/refacciones`);
        if (!refaccionesResponse.ok) {
          throw new Error('Error al cargar refacciones');
        }
        const refacciones = await refaccionesResponse.json();

        // Cargar usuarios
        const usuariosResponse = await fetch(`${API_URL}/users`);
        if (!usuariosResponse.ok) {
          throw new Error('Error al cargar usuarios');
        }
        const usuariosData = await usuariosResponse.json();

        // Calcular estadísticas
        const totalStock = refacciones.refacciones ? 
          refacciones.refacciones.reduce((acc, ref) => acc + ref.stock, 0) : 0;
        
        // Agrupar por categorías
        const categoriasMap = (refacciones.refacciones || []).reduce((acc, ref) => {
          if (!acc[ref.categoria]) {
            acc[ref.categoria] = {
              nombre: ref.categoria,
              cantidad: 0,
              icono: getIconoForCategoria(ref.categoria),
              descripcion: getDescripcionForCategoria(ref.categoria)
            };
          }
          acc[ref.categoria].cantidad++;
          return acc;
        }, {});

        setStats({
          totalRefacciones: refacciones.refacciones ? refacciones.refacciones.length : 0,
          totalStock,
          totalUsuarios: usuariosData.total || 0,
          totalVentas: 0, // TODO: Implementar cuando tengamos el módulo de ventas
          categorias: Object.values(categoriasMap)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message || 'Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Función auxiliar para asignar iconos a categorías
  const getIconoForCategoria = (categoria) => {
    const iconos = {
      'Filtros': '🔧',
      'Frenos': '🛑',
      'Lubricantes': '🛢️',
      'Suspensión': '🚗',
      'Eléctrico': '⚡',
      'Llantas': '⭕',
      'Encendido': '🔥',
      'Carrocería': '🚘'
    };
    return iconos[categoria] || '🔧';
  };

  // Función auxiliar para asignar descripciones a categorías
  const getDescripcionForCategoria = (categoria) => {
    const descripciones = {
      'Filtros': 'Filtros de aceite, aire y combustible',
      'Frenos': 'Pastillas y discos de freno',
      'Lubricantes': 'Aceites y lubricantes',
      'Suspensión': 'Amortiguadores y componentes',
      'Eléctrico': 'Baterías y componentes eléctricos',
      'Llantas': 'Llantas y rines',
      'Encendido': 'Bujías y bobinas',
      'Carrocería': 'Partes exteriores del vehículo'
    };
    return descripciones[categoria] || 'Productos varios';
  };

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-spinner">Cargando...</div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container">
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className='dashboard-container'>
      <div className='dashboard-header'>
        <h1>Panel de Control</h1>
        <p>Bienvenido al sistema de gestión</p>
      </div>

      <div className='dashboard-grid'>
        {/* Tarjeta de Resumen de Ventas */}
        <div className='dashboard-card'>
          <div className='card-header'>
            <h3>Ventas Totales</h3>
            <span className='card-icon'>💰</span>
          </div>
          <div className='card-content'>
            <h2>${stats.totalVentas.toLocaleString()}</h2>
            <p>Total de ventas</p>
          </div>
          <Link to="/ventas" className='card-link'>Ver detalles →</Link>
        </div>

        {/* Tarjeta de Inventario */}
        <div className='dashboard-card'>
          <div className='card-header'>
            <h3>Productos en Stock</h3>
            <span className='card-icon'>📦</span>
          </div>
          <div className='card-content'>
            <h2>{stats.totalStock}</h2>
            <p>{stats.totalRefacciones} productos diferentes</p>
          </div>
          <Link to="/stocks" className='card-link'>Ver inventario →</Link>
        </div>

        {/* Tarjeta de Usuarios */}
        <div className='dashboard-card'>
          <div className='card-header'>
            <h3>Empleados Activos</h3>
            <span className='card-icon'>👥</span>
          </div>
          <div className='card-content'>
            <h2>{stats.totalUsuarios}</h2>
            <p>Usuarios registrados</p>
          </div>
          <Link to="/usuarios" className='card-link'>Ver empleados →</Link>
        </div>

        {/* Tarjeta de Pedidos */}
        <div className='dashboard-card'>
          <div className='card-header'>
            <h3>Pedidos Pendientes</h3>
            <span className='card-icon'>📋</span>
          </div>
          <div className='card-content'>
            <h2>0</h2>
            <p>Sin pedidos pendientes</p>
          </div>
          <Link to="/pedidos" className='card-link'>Ver pedidos →</Link>
        </div>
      </div>

      <div className='dashboard-categories'>
        <h2>Categorías de Productos</h2>
        <div className='categories-grid'>
          {stats.categorias.map((categoria, index) => (
            <div key={index} className='category-card'>
              <div className='category-header'>
                <span className='category-icon'>{categoria.icono}</span>
                <h3>{categoria.nombre}</h3>
              </div>
              <p>{categoria.descripcion}</p>
              <div className='category-footer'>
                <span>{categoria.cantidad} productos</span>
                <Link to="/stocks" className='category-link'>Ver productos →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='dashboard-charts'>
        <div className='chart-container'>
          <h3>Ventas por Categoría</h3>
          <div className='chart-placeholder'>
            Gráfico de ventas por categoría
          </div>
        </div>
        <div className='chart-container'>
          <h3>Tendencia de Ventas</h3>
          <div className='chart-placeholder'>
            Gráfico de tendencia
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;