import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../constants/routes';

export default function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, user } = useSelector(s => s.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }

    return children;
}
