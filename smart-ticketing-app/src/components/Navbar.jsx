import { Link } from 'react-router-dom';

function Navbar() {
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    
    localStorage.removeItem("user");
    
    
    alert("Aap successfully log out ho gaye hain!");
    
    
    window.location.href = "/"; 
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>🎟️ Smart Ticketing</div>
      
      <div style={styles.menu}>
        <Link to="/" style={styles.link}>Home</Link>
        
        {/* Agar login user ADMIN hai, sirf tabhi ye link dikhega */}
        {user && user.role === 'Admin' && (
          <Link to="/admin" style={styles.link}>Admin Panel</Link>
        )}

        {/* Agar user logged in hai, toh 'Logout', warna 'Sign In' dikhao */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
              Hi, {user.name.split(' ')[0]} 👋
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" style={styles.authButton}>
            Sign In / Register
          </Link>
        )}
      </div>
    </nav>
  );
}

// Thodi nayi styling
const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#2c3e50', color: 'white', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#ecf0f1' },
  menu: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' },
  authButton: { backgroundColor: '#3498db', padding: '8px 16px', borderRadius: '5px', color: 'white', textDecoration: 'none', fontWeight: 'bold', transition: '0.3s' },
  logoutButton: { backgroundColor: '#e74c3c', padding: '8px 16px', borderRadius: '5px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }
};

export default Navbar;