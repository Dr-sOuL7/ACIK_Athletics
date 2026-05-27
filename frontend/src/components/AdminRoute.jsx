import { Navigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";

export default function AdminRoute({
  children,
}) {

  const token =
    localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  let decoded;

  try {

    decoded = jwtDecode(token);

  } catch {

    return <Navigate to="/login" />;
  }

  if (decoded.role !== "admin") {

    return <Navigate to="/" />;
  }

  return children;
}