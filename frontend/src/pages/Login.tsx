import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';

export default function Login() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}
