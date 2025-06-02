import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './tienda.css';

const API_URL = 'http://localhost:3000/api';

function Tienda() {
  const [refacciones, setRefacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(8);
  const [carrito, setCarrito] = useState([]);
  const [modalCantidad, setModalCantidad] = useState({
    mostrar: false,
    refaccion: null,
    cantidad: 1
  });

  // Cargar refacciones desde la API
  useEffect(() => {
    const cargarRefacciones = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay sesión activa');

        const response = await fetch(
          `${API_URL}/refacciones?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar las refacciones');
        }

        const data = await response.json();
        if (!data.refacciones) throw new Error('Formato de datos inválido');

        setRefacciones(data.refacciones);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error al cargar refacciones:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarRefacciones();
  }, [currentPage, searchTerm, itemsPerPage]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        localStorage.removeItem('carrito');
      }
    }
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const abrirModalCantidad = (refaccion) => {
    setModalCantidad({
      mostrar: true,
      refaccion,
      cantidad: 1
    });
  };

  const cerrarModalCantidad = () => {
    setModalCantidad({
      mostrar: false,
      refaccion: null,
      cantidad: 1
    });
  };

  const actualizarCantidad = (e) => {
    const cantidad = parseInt(e.target.value);
    if (cantidad > 0 && cantidad <= modalCantidad.refaccion.stock) {
      setModalCantidad(prev => ({
        ...prev,
        cantidad
      }));
    }
  };

  const agregarAlCarrito = () => {
    try {
      const { refaccion, cantidad } = modalCantidad;
      const itemExistente = carrito.find(item => item._id === refaccion._id);

      if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        if (nuevaCantidad > refaccion.stock) {
          toast.error('No hay suficiente stock disponible');
          return;
        }

        const nuevoCarrito = carrito.map(item =>
          item._id === refaccion._id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
        setCarrito(nuevoCarrito);
        localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      } else {
        if (cantidad > refaccion.stock) {
          toast.error('No hay suficiente stock disponible');
          return;
        }

        const nuevoCarrito = [...carrito, { ...refaccion, cantidad }];
        setCarrito(nuevoCarrito);
        localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      }

      toast.success('Producto agregado al carrito');
      cerrarModalCantidad();
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar el producto al carrito');
    }
  };

  if (loading) {
    return (
      <div className="tienda-container">
        <div className="loading">
          <h2>Cargando refacciones...</h2>
          <p>Por favor espere un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tienda-container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <p>Por favor, intente nuevamente más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tienda-container">
      <h1>Tienda de Refacciones</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar refacciones..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {refacciones.length === 0 ? (
        <div className="no-items">
          <h2>No se encontraron refacciones</h2>
          <p>Intente con otra búsqueda o vuelva más tarde</p>
        </div>
      ) : (
        <>
          <div className="productos-grid">
            {refacciones.map(refaccion => (
              <div key={refaccion._id} className="producto-card">
                <div className="producto-info">
                  <h3>{refaccion.nombre}</h3>
                  <p className="categoria">{refaccion.categoria}</p>
                  <p className="precio">${refaccion.precio.toFixed(2)}</p>
                </div>
                <button
                  className="btn-agregar"
                  onClick={() => abrirModalCantidad(refaccion)}
                >
                  Agregar al carrito
                </button>
              </div>
            ))}
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
        </>
      )}

      {/* Modal de cantidad */}
      {modalCantidad.mostrar && (
        <div className="modal-overlay">
          <div className="modal-cantidad">
            <h3>Seleccionar cantidad</h3>
            
            <div className="modal-info">
              <p>Producto: {modalCantidad.refaccion.nombre}</p>
              <p>Precio unitario: ${modalCantidad.refaccion.precio.toFixed(2)}</p>
            </div>

            <div className="cantidad-input">
              <label>Cantidad:</label>
              <input
                type="number"
                min="1"
                max={modalCantidad.refaccion.stock}
                value={modalCantidad.cantidad}
                onChange={actualizarCantidad}
              />
            </div>

            <div className="modal-total">
              <p>Total: ${(modalCantidad.refaccion.precio * modalCantidad.cantidad).toFixed(2)}</p>
            </div>

            <div className="modal-buttons">
              <button onClick={agregarAlCarrito} className="btn-confirmar">
                Agregar al carrito
              </button>
              <button onClick={cerrarModalCantidad} className="btn-cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tienda;
