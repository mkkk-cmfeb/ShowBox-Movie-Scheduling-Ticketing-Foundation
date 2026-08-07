import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const userStr = localStorage.getItem("user");

  // Agar user login hi nahi hai
  if (!userStr) {
    alert("Please login to continue.");
    return <Navigate to="/auth" />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // THE FIX: Dono roles ko UPPERCASE mein convert karke check karo
    const userRole = user.role ? user.role.toUpperCase() : "";
    const expectedRole = requiredRole ? requiredRole.toUpperCase() : "";

    // Agar role match nahi hota
    if (requiredRole && userRole !== expectedRole) {
      alert("Access Denied! Sirf Admin yahan aa sakte hain.");
      return <Navigate to="/" />; // Wapas home par bhej do
    }

    // Agar sab theek hai, toh andar jaane do (Admin Dashboard khul jayega)
    return children;
    
  } catch (error) {
    // Agar local storage ka data corrupt ho gaya ho
    localStorage.removeItem("user");
    return <Navigate to="/auth" />;
  }
}

export default ProtectedRoute;