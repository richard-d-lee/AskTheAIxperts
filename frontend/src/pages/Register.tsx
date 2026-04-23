import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/Auth/RegisterForm';

export default function Register() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <RegisterForm />;
}
