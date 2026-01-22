import { useState } from 'react';
import API from '../apis/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/register', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-2 border rounded"
            type="text" placeholder="Username" 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} required 
          />
          <input 
            className="w-full p-2 border rounded"
            type="email" placeholder="Email" 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} required 
          />
          <input 
            className="w-full p-2 border rounded"
            type="password" placeholder="Password" 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} required 
          />
          <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;