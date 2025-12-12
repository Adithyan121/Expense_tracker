import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Layout from './Layout'; // We'll create this next

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return user ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
