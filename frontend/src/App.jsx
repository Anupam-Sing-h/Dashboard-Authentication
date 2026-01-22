import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  // Simple "Bouncer" to protect the dashboard
  // It checks if a token exists in local storage
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    // The Router is the wrapper that enables navigation
    <Router>
      <Routes>
        {/* If URL is /login, show Login page */}
        <Route path="/login" element={<Login />} />
        
        {/* If URL is /register, show Register page */}
        <Route path="/register" element={<Register />} />
        
        {/* If URL is /dashboard, check if logged in, then show Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* If URL is anything else (unknown), go to Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
