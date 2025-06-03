import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Ventas.css';

function Ventas() {
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);

  const cargarCarrito = () => {
    try {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        const carritoParseado = JSON.parse(carritoGuardado);
        if (Array.isArray(carritoParseado)) {
          setCarrito(carritoParseado);
        } else {
          setCarrito([]);
        }
      } else {
        setCarrito([]);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      setCarrito([]);
    }
  };

  // Cargar el carrito desde localStorage al iniciar
  useEffect(() => {
    cargarCarrito();

    // Escuchar cambios en el carrito
    window.addEventListener('carritoActualizado', cargarCarrito);

    return () => {
      window.removeEventListener('carritoActualizado', cargarCarrito);
    };
  }, []);

  // Actualizar el total cuando cambia el carrito
  useEffect(() => {
    const nuevoTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setTotal(nuevoTotal);
  }, [carrito]);

  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const item = carrito.find(item => item.id === id);
    if (!item) return;

    if (nuevaCantidad > item.stock) {
      toast.error('La cantidad excede el stock disponible');
      return;
    }

    setCarrito(prevCarrito => {
      const nuevoCarrito = prevCarrito.map(item => 
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      );
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });
  };

  const eliminarDelCarrito = async (id) => {
    const item = carrito.find(item => item.id === id);
    if (!item) return;

    try {
      // Restaurar el stock en la base de datos
      const response = await fetch(`https://backendref.onrender.com/api/refacciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stock: item.stock + item.cantidad
        })
      });

      if (!response.ok) {
        throw new Error('Error al restaurar el stock');
      }

      setCarrito(prevCarrito => {
        const nuevoCarrito = prevCarrito.filter(item => item.id !== id);
        localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
        return nuevoCarrito;
      });
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      toast.error('Error al eliminar del carrito');
    }
  };

  const procesarVenta = async () => {
    try {
      if (carrito.length === 0) {
        toast.error('El carrito está vacío');
        return;
      }

      // Aquí iría la lógica para procesar la venta con el backend
      // Por ahora solo limpiaremos el carrito
      setCarrito([]);
      localStorage.removeItem('carrito');
      toast.success('Venta procesada exitosamente');
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      toast.error('Error al procesar la venta');
    }
  };

  return (
    <div className="ventas-container">
      <h1>Carrito de Ventas</h1>
      
      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <p>No hay productos en el carrito</p>
        </div>
      ) : (
        <>
          <div className="carrito-items">
            <table className="ventas-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map(item => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>${item.precio.toFixed(2)}</td>
                    <td>
                      <div className="cantidad-controls">
                        <button 
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="btn-cantidad"
                          disabled={item.cantidad <= 1}
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button 
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="btn-cantidad"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="btn-eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="resumen-venta">
            <div className="total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={procesarVenta}
              className="btn-procesar"
            >
              Procesar Venta
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Ventas;