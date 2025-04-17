import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => { // Проверяет авторизацию пользователя
    const { isAuth } = useSelector((state: RootState) => state.auth); // Получаем состояние авторизации из Redux
    const location = useLocation(); // Получаем текущий путь

    if (!isAuth) {
        // Сохраняем текущий путь, чтобы вернуться после авторизации
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 