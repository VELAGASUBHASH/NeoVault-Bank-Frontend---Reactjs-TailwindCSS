import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// FIX: Default allowedRoles to an empty array [] to prevent undefined crashes
export default function ProtectedRoute({ allowedRoles = [] }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Force role check string matching to handle both variants safely
    const userRole = user.role?.startsWith("ROLE_") ? user.role : `ROLE_${user.role}`;

    // Safety handling for cases where allowedRoles might be empty or missing
    const hasAccess = allowedRoles.length === 0 || allowedRoles.some(role => {
        const structuralRole = role.startsWith("ROLE_") ? role : `ROLE_${role}`;
        return structuralRole === userRole;
    });

    if (!hasAccess) {
        // Safe redirect to prevent routing black holes
        return <Navigate to={userRole === "ROLE_ADMIN" ? "/admin" : "/dashboard"} replace />;
    }

    return <Outlet />;
}