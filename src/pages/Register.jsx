import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Register.css'
import ErrorForm from '../components/ErrorForm'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    password: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Llamar al servicio de registro
      await register(formData.usuario, formData.password);
      // Mostrar notificación de éxito
      toast.success('¡Registro exitoso! Serás redirigido al dashboard.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Redirigir al dashboard después del registro exitoso
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setError(error.message);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className='container-register'>
      <ToastContainer />
      <div className='register-card'>
        <div className='register-header'>
          <h1>Crear Cuenta</h1>
          <p>Regístrate para comenzar</p>
        </div>
        
        {(error || authError) && <ErrorForm message={error || authError} />}
        
        <form className='form-register' onSubmit={handleSubmit}>
          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor="nombre">Nombre</label>
              <input 
                type="text" 
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder='Tu nombre'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor="apellido">Apellido</label>
              <input 
                type="text" 
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder='Tu apellido'
                required
              />
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='tu@email.com'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="usuario">Nombre de Usuario</label>
            <input 
              type="text" 
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder='Elige un nombre de usuario'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder='Crea una contraseña segura'
              required
              minLength={6}
            />
          </div>

          <div className='form-group'>
            <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              placeholder='Confirma tu contraseña'
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className='btn-register'
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className='register-footer'>
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register 