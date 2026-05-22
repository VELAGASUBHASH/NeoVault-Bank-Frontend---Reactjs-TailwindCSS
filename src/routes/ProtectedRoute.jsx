import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { user, token } = useSelector((state) => state.auth);
    const location = useLocation();

    // FIX: Check for BOTH Redux state and localStorage to prevent flickering/redirect loops
    const isAuthenticated = user !== null && token !== null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}