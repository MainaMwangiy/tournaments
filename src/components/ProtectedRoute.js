import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [hasToken, setHasToken] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    setHasToken(!!token);
  }, []);

  if (hasToken === null) {
    return <div>Loading...</div>;
  }

  if (!hasToken || !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;