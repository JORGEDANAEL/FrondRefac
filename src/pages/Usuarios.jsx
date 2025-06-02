import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Usuarios.css';

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: ''
  });
  const usersPerPage = 10;
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:3000/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los usuarios');
      }

      const data = await response.json();
      
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Formato de datos inválido');
      }

      setUsers(data.users);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, searchTerm]);

  // Efecto para cargar usuarios inicialmente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Efecto para manejar cambios de página
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Efecto para la búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setIsSearching(true);
        setCurrentPage(1);
        fetchUsers();
      } else {
        fetchUsers();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      password: ''
    });
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar el usuario');
        }

        const data = await response.json();
        
        // Mostrar notificación de éxito
        toast.success('Usuario eliminado exitosamente', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored"
        });

        // Actualizar la lista de usuarios
        setUsers(users.filter(user => user._id !== userId));
        
        // Si era el último usuario de la página, retroceder una página
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        toast.error(error.message || 'Error al eliminar el usuario', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored"
        });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      toast.success('Usuario actualizado exitosamente');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAgregar = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewUser({
      username: '',
      password: ''
    });
  };

  const handleNewUserChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario');
      }

      toast.success('Usuario creado exitosamente');
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="usuarios-container">
      <h1>Lista de Usuarios Registrados</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
          disabled={loading}
        />
        {isSearching && <span className="searching-indicator">Buscando...</span>}
      </div>
      
      <button className="btn-agregar-flotante" onClick={handleAgregar}>
        + Agregar Usuario
      </button>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Agregar Nuevo Usuario</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-save">Guardar</button>
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !isSearching ? (
        <div className="loading">Cargando usuarios...</div>
      ) : error ? (
        <div className="error-container">
          <div className="error">Error: {error}</div>
          <button className="retry-btn" onClick={() => fetchUsers()}>
            Reintentar
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="no-users">
          {searchTerm ? 'No se encontraron usuarios con ese nombre' : 'No hay usuarios registrados'}
        </div>
      ) : (
        <>
          <div className="usuarios-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre de Usuario</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.username}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No disponible'}</td>
                    <td>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user._id)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Anterior
            </button>
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {editingUser && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-save">Guardar</button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setEditingUser(null)}
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

export default Usuarios; 