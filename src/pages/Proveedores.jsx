import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './provedores.css';

const API_URL = 'https://backendref.onrender.com/api';

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    productos: ''
  });

  // Función para cargar proveedores
  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/proveedores?page=${currentPage}&limit=10&search=${searchTerm}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar los proveedores');
      }

      const data = await response.json();
      setProveedores(data.proveedores || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Cargar proveedores cuando cambia la página o el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProveedores();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProveedor 
        ? `${API_URL}/proveedores/${editingProveedor._id}`
        : `${API_URL}/proveedores`;
      
      const method = editingProveedor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar el proveedor');
      }

      const data = await response.json();
      
      if (editingProveedor) {
        setProveedores(prev => 
          prev.map(p => p._id === editingProveedor._id ? data : p)
        );
        toast.success('Proveedor actualizado exitosamente');
      } else {
        setProveedores(prev => [...prev, data]);
        toast.success('Proveedor agregado exitosamente');
      }

      setShowModal(false);
      setEditingProveedor(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        productos: ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email,
      productos: proveedor.productos
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      try {
        const response = await fetch(`${API_URL}/proveedores/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el proveedor');
        }

        setProveedores(prev => prev.filter(p => p._id !== id));
        toast.success('Proveedor eliminado exitosamente');
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="proveedores-container">
      <div className="proveedores-header">
        <h1>Gestión de Proveedores</h1>
        <button 
          className="btn-agregar"
          onClick={() => {
            setEditingProveedor(null);
            setFormData({
              nombre: '',
              direccion: '',
              telefono: '',
              email: '',
              productos: ''
            });
            setShowModal(true);
          }}
        >
          + Agregar Proveedor
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar proveedor por nombre, email o productos..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="btn-limpiar"
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="proveedores-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(proveedor => (
              <tr key={proveedor._id}>
                <td>{proveedor.nombre}</td>
                <td>{proveedor.direccion}</td>
                <td>
                  <div className="telefono-container">
                    {proveedor.telefono}
                    <button 
                      className="btn-llamar"
                      onClick={() => window.location.href = `tel:${proveedor.telefono}`}
                      title="Llamar"
                    >
                      📞
                    </button>
                  </div>
                </td>
                <td>
                  <div className="email-container">
                    {proveedor.email}
                    <button 
                      className="btn-mensaje"
                      onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${proveedor.email}`, '_blank')}
                      title="Enviar mensaje por Gmail"
                    >
                      ✉️
                    </button>
                  </div>
                </td>
                <td>{proveedor.productos}</td>
                <td>
                  <div className="acciones-container">
                    <button 
                      className="btn-editar"
                      onClick={() => handleEdit(proveedor)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleDelete(proveedor._id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Anterior
        </button>
        <span className="page-info">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Siguiente
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingProveedor ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección:</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Productos:</label>
                <textarea
                  name="productos"
                  value={formData.productos}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-guardar">
                  {editingProveedor ? 'Actualizar' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProveedor(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proveedores; 