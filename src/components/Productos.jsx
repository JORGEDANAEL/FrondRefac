import { useState, useEffect } from 'react';
import api from '../config/axios';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const response = await api.get('/api/productos');
                setProductos(response.data);
            } catch (error) {
                setError('Error al obtener los productos');
                console.error('Error:', error);
            }
        };

        obtenerProductos();
    }, []);

    // Ejemplo de cómo hacer un POST
    const crearProducto = async (nuevoProducto) => {
        try {
            const response = await api.post('/api/productos', nuevoProducto);
            return response.data;
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error;
        }
    };

    // Ejemplo de cómo hacer un PUT
    const actualizarProducto = async (id, datosActualizados) => {
        try {
            const response = await api.put(`/api/productos/${id}`, datosActualizados);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    };

    // Ejemplo de cómo hacer un DELETE
    const eliminarProducto = async (id) => {
        try {
            await api.delete(`/api/productos/${id}`);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw error;
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Lista de Productos</h2>
            {productos.map(producto => (
                <div key={producto.id}>
                    <h3>{producto.nombre}</h3>
                    <p>{producto.descripcion}</p>
                    <p>Precio: ${producto.precio}</p>
                </div>
            ))}
        </div>
    );
};

export default Productos; 