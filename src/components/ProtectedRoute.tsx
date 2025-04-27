import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { checkAuth } from '../store/slices/authSlice'
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => { // Проверяет авторизацию пользователя
    const { isAuth } = useSelector((state: RootState) => state.auth); // Получаем состояние авторизации из Redux
    const location = useLocation(); // Получаем текущий путь
    const dispatch = useDispatch<AppDispatch>();

    // Проверяем авторизацию без влияния на рендеринг
    useEffect(() => {
        if (isAuth) {
            // Проверяем актуальность токена без блокировки UI
            dispatch(checkAuth());
        }
    }, [dispatch, isAuth]);

    // Принимаем решение о рендеринге только на основе локальных данных
    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
};

export default ProtectedRoute; 