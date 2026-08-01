import { Navigate } from 'react-router-dom';

// Ye component ek Guard ki tarah hai
const ProtectedRoute = ({ children, requiredRole }) => {
  // Check karte hain ki localStorage mein koi user save hai ya nahi
  const userString = localStorage.getItem("user");
  
  // Agar user logged in nahi hai, toh usko Auth (Login) page par bhej do
  if (!userString) {
    return <Navigate to="/auth" />;
  }

  const user = JSON.parse(userString);

  // Agar route ke liye Admin hona zaroori hai, par user normal hai, toh Home par bhej do
  if (requiredRole && user.role !== requiredRole) {
    alert("Access Denied! Sirf Admin yahan aa sakte hain.");
    return <Navigate to="/" />;
  }

  // Agar sab sahi hai, toh usko page dekhne do
  return children;
};

export default ProtectedRoute;