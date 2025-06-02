import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Stocks.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:3000/api';

function Stocks() {
  const [refacciones, setRefacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [nuevaRefaccion, setNuevaRefaccion] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria: ''
  });
  const [modalVenta, setModalVenta] = useState({
    mostrar: false,
    refaccion: null,
    cantidad: 1
  });
  const [refaccionEditando, setRefaccionEditando] = useState(null);
  const [modalRefaccion, setModalRefaccion] = useState(false);

  // Filtrar refacciones basado en el término de búsqueda
  const refaccionesFiltradas = refacciones.filter(refaccion => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      refaccion.nombre.toLowerCase().includes(searchTermLower) ||
      refaccion.categoria.toLowerCase().includes(searchTermLower) ||
      refaccion._id.toString().includes(searchTermLower)
    );
  });

  // Cargar refacciones desde la API
  useEffect(() => {
    const cargarRefacciones = async () => {
      try {
        const response = await fetch(
          `${API_URL}/refacciones?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}&search=${searchTerm}`
        );
        if (!response.ok) {
          throw new Error('Error al cargar las refacciones');
        }
        const data = await response.json();
        setRefacciones(data.refacciones);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages,
          totalItems: data.totalItems
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar refacciones:', error);
        setError('Error al cargar las refacciones');
        setLoading(false);
      }
    };

    cargarRefacciones();
  }, [pagination.currentPage, searchTerm]);

  const handleEditar = (refaccion) => {
    setRefaccionEditando(refaccion);
    setNuevaRefaccion({
      nombre: refaccion.nombre,
      precio: refaccion.precio.toString(),
      stock: refaccion.stock.toString(),
      categoria: refaccion.categoria
    });
    setModalRefaccion(true);
  };

  const handleAgregar = () => {
    setRefaccionEditando(null);
    setNuevaRefaccion({
      nombre: '',
      precio: '',
      stock: '',
      categoria: ''
    });
    setModalRefaccion(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta refacción?')) {
      try {
        const response = await fetch(`${API_URL}/refacciones/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar la refacción');
        }

        setRefacciones(prevRefacciones => prevRefacciones.filter(ref => ref._id !== id));
        toast.success('Refacción eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar refacción:', error);
        toast.error('Error al eliminar la refacción');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas por campo
    if (name === 'precio' && parseFloat(value) < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }
    
    if (name === 'stock' && parseInt(value) < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    setNuevaRefaccion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (parseFloat(nuevaRefaccion.precio) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }
    
    if (parseInt(nuevaRefaccion.stock) < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    try {
      if (refaccionEditando) {
        // Actualizar refacción existente
        const response = await fetch(`${API_URL}/refacciones/${refaccionEditando._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: nuevaRefaccion.nombre,
            precio: parseFloat(nuevaRefaccion.precio),
            stock: parseInt(nuevaRefaccion.stock),
            categoria: nuevaRefaccion.categoria
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar la refacción');
        }

        const data = await response.json();
        setRefacciones(prevRefacciones =>
          prevRefacciones.map(ref =>
            ref._id === refaccionEditando._id ? data : ref
          )
        );
        toast.success('Refacción actualizada exitosamente');
        setRefaccionEditando(null);
      } else {
        // Agregar nueva refacción
        const response = await fetch(`${API_URL}/refacciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: nuevaRefaccion.nombre,
            precio: parseFloat(nuevaRefaccion.precio),
            stock: parseInt(nuevaRefaccion.stock),
            categoria: nuevaRefaccion.categoria
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear la refacción');
        }

        const data = await response.json();
        setRefacciones(prev => [...prev, data]);
        toast.success('Refacción agregada exitosamente');
      }

      // Limpiar formulario
      setNuevaRefaccion({
        nombre: '',
        precio: '',
        stock: '',
        categoria: ''
      });
    } catch (error) {
      console.error('Error al guardar refacción:', error);
      toast.error('Error al guardar la refacción');
    }
  };

  const abrirModalVenta = (refaccion) => {
    setModalVenta({
      mostrar: true,
      refaccion,
      cantidad: 1
    });
  };

  const cerrarModalVenta = () => {
    setModalVenta({
      mostrar: false,
      refaccion: null,
      cantidad: 1
    });
  };

  const actualizarCantidadVenta = (e) => {
    const cantidad = parseInt(e.target.value);
    if (cantidad > 0 && cantidad <= modalVenta.refaccion.stock) {
      setModalVenta(prev => ({
        ...prev,
        cantidad
      }));
    }
  };

  const agregarAlCarrito = async () => {
    try {
      const { refaccion, cantidad } = modalVenta;
      
      if (!refaccion || !cantidad) {
        toast.error('Error: Datos de venta incompletos');
        return;
      }

      if (cantidad <= 0) {
        toast.error('La cantidad debe ser mayor a 0');
        return;
      }

      if (cantidad > refaccion.stock) {
        toast.error('La cantidad excede el stock disponible');
        return;
      }
      
      // Obtener el carrito actual
      let carritoActual = [];
      try {
        const carritoGuardado = localStorage.getItem('carrito');

        if (carritoGuardado) {
          carritoActual = JSON.parse(carritoGuardado);
          if (!Array.isArray(carritoActual)) {
            carritoActual = [];
          }
        }
      } catch (error) {
        console.error('Error al leer el carrito:', error);
        carritoActual = [];
      }
      
      // Verificar si el producto ya está en el carrito
      const productoExistente = carritoActual.find(item => item.id === refaccion._id);
      
      let nuevoCarrito;
      if (productoExistente) {
        // Verificar si la cantidad total no excede el stock
        const cantidadTotal = productoExistente.cantidad + cantidad;
        if (cantidadTotal > refaccion.stock) {
          toast.error('La cantidad total excede el stock disponible');
          return;
        }
        
        // Actualizar cantidad si el producto ya existe
        nuevoCarrito = carritoActual.map(item =>
          item.id === refaccion._id
            ? { ...item, cantidad: cantidadTotal }
            : item
        );
      } else {
        // Agregar nuevo producto al carrito
        nuevoCarrito = [...carritoActual, { 
          id: refaccion._id,
          nombre: refaccion.nombre,
          precio: refaccion.precio,
          cantidad: cantidad,
          stock: refaccion.stock,
          categoria: refaccion.categoria
        }];
      }
      
      // Actualizar el stock en la base de datos
      const nuevoStock = refaccion.stock - cantidad;
      const response = await fetch(`${API_URL}/refacciones/${refaccion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...refaccion,
          stock: nuevoStock
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      // Guardar el carrito actualizado
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      
      // Actualizar el estado local
      setRefacciones(prevRefacciones =>
        prevRefacciones.map(item =>
          item._id === refaccion._id
            ? { ...item, stock: nuevoStock }
            : item
        )
      );
      
      toast.success('Producto agregado al carrito exitosamente');
      cerrarModalVenta();

      // Forzar la actualización del carrito en la página de Ventas
      window.dispatchEvent(new Event('carritoActualizado'));
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  const cerrarModalRefaccion = () => {
    setModalRefaccion(false);
    setRefaccionEditando(null);
    setNuevaRefaccion({
      nombre: '',
      precio: '',
      stock: '',
      categoria: ''
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const exportarPDF = () => {
    try {
      // Verificar si hay datos para exportar
      if (!refaccionesFiltradas || refaccionesFiltradas.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Título del documento
      doc.setFontSize(16);
      doc.text('Reporte de Inventario', 14, 15);
      
      // Fecha y hora
      doc.setFontSize(10);
      const fecha = new Date().toLocaleDateString();
      const hora = new Date().toLocaleTimeString();
      doc.text(`Generado el: ${fecha} ${hora}`, 14, 25);

      // Preparar datos para la tabla
      const tableColumn = ["ID", "Nombre", "Categoría", "Precio", "Stock"];
      const tableRows = refaccionesFiltradas.map(refaccion => {
        // Asegurarse de que todos los valores sean strings
        return [
          String(refaccion._id || ''),
          String(refaccion.nombre || ''),
          String(refaccion.categoria || ''),
          `$${Number(refaccion.precio || 0).toFixed(2)}`,
          String(refaccion.stock || 0)
        ];
      });

      // Generar la tabla
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
        },
      });

      // Guardar el PDF
      doc.save('inventario-refacciones.pdf');
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error detallado al generar PDF:', error);
      toast.error(`Error al generar el PDF: ${error.message}`);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validar el formato del Excel
        const requiredFields = ['nombre', 'precio', 'stock', 'categoria'];
        const isValidFormat = jsonData.every(row => 
          requiredFields.every(field => row[field] !== undefined)
        );

        if (!isValidFormat) {
          toast.error('El archivo Excel debe contener las columnas: nombre, precio, stock, categoria');
          return;
        }

        // Procesar cada fila
        for (const row of jsonData) {
          try {
            const response = await fetch(`${API_URL}/refacciones`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                nombre: String(row.nombre),
                precio: Number(row.precio),
                stock: Number(row.stock),
                categoria: String(row.categoria)
              })
            });

            if (!response.ok) {
              throw new Error(`Error al agregar ${row.nombre}`);
            }
          } catch (error) {
            console.error(`Error al procesar fila:`, error);
            toast.error(`Error al agregar ${row.nombre}`);
          }
        }

        // Recargar las refacciones
        const response = await fetch(
          `${API_URL}/refacciones?page=${pagination.currentPage}&limit=${pagination.itemsPerPage}&search=${searchTerm}`
        );
        if (response.ok) {
          const data = await response.json();
          setRefacciones(data.refacciones);
          toast.success('Importación completada');
        }
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        toast.error('Error al procesar el archivo Excel');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="stocks-container">
      <div className="stocks-header">
        <h1>Gestión de Inventario</h1>
        <div className="stocks-actions">
          <div className="file-upload-container">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="btn-importar">
              Importar Excel
            </label>
          </div>
          <button onClick={exportarPDF} className="btn-exportar">
            Exportar PDF
          </button>
        </div>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por ID, nombre o categoría..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPagination(prev => ({ ...prev, currentPage: 1 }));
          }}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="clear-search"
            onClick={() => {
              setSearchTerm('');
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Botón para abrir el modal de agregar refacción */}
      <button className="btn-agregar-flotante" onClick={handleAgregar}>
        + Agregar Refacción
      </button>
      
      {/* Mostrar mensaje si no hay resultados */}
      {searchTerm && refacciones.length === 0 && (
        <div className="no-results">
          No se encontraron resultados para "{searchTerm}"
        </div>
      )}
      
      <div className="table-container">
        <table className="stocks-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio por unidad</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {refaccionesFiltradas.map(refaccion => (
              <tr key={refaccion._id}>
                <td>{refaccion._id}</td>
                <td>{refaccion.nombre}</td>
                <td>${refaccion.precio.toFixed(2)}</td>
                <td>{refaccion.stock}</td>
                <td>{refaccion.categoria}</td>
                <td>
                  <button className="btn-editar" onClick={() => handleEditar(refaccion)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(refaccion._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || refacciones.length === 0}
            className="pagination-button"
          >
            Anterior
          </button>
          <span className="pagination-info">
            {refacciones.length === 0 ? 'No hay resultados' : `Página ${pagination.currentPage} de ${pagination.totalPages}`}
          </span>
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages || refacciones.length === 0}
            className="pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal de agregar/editar refacción */}
      {modalRefaccion && (
        <div className="modal-overlay">
          <div className="modal-refaccion">
            <h2>{refaccionEditando ? 'Editar Refacción' : 'Agregar Nueva Refacción'}</h2>
            <form onSubmit={handleSubmit} className="refaccion-form">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevaRefaccion.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio por unidad:</label>
                <input
                  type="number"
                  name="precio"
                  value={nuevaRefaccion.precio}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={nuevaRefaccion.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría:</label>
                <input
                  type="text"
                  name="categoria"
                  value={nuevaRefaccion.categoria}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar">
                  {refaccionEditando ? 'Actualizar Refacción' : 'Agregar Refacción'}
                </button>
                <button type="button" className="btn-cancelar" onClick={cerrarModalRefaccion}>
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

export default Stocks;
