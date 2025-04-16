import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuth } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!isAuth) {
        // Сохраняем текущий путь, чтобы вернуться после авторизации
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 