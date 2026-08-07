import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>Smart Ticketing</Link>

      <div style={styles.menu}>
        <Link to="/" style={styles.link}>Home</Link>

        {user && user.role && user.role.toUpperCase() === 'ADMIN' && (
          <Link to="/admin" style={styles.link}>Admin Panel</Link>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/my-tickets" style={styles.link}>My Tickets</Link>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={styles.userName}>{user.name.split(' ')[0]}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" style={styles.authButton}>
            Sign In / Register
          </Link>
        )}
        <Link to="/crowdfunding" style={styles.link}>Crowdfunding</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#2c3e50', color: 'white', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#ecf0f1', textDecoration: 'none' },
  menu: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px 4px 4px', borderRadius: '20px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#f1c40f', color: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.95rem' },
  userName: { color: '#ecf0f1', fontWeight: 'bold', fontSize: '0.95rem' },
  authButton: { backgroundColor: '#3498db', padding: '8px 16px', borderRadius: '5px', color: 'white', textDecoration: 'none', fontWeight: 'bold', transition: '0.3s' },
  logoutButton: { backgroundColor: '#e74c3c', padding: '8px 16px', borderRadius: '5px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }
};

export default Navbar;
