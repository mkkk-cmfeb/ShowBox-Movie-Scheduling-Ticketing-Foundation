import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Register
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'User' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";
    
    try {
      const response = await fetch(`https://localhost:7004/api/Users/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if (isLogin) {
          const user = await response.json();
          localStorage.setItem("user", JSON.stringify(user)); // User data save
          alert("Login Successful!");
          window.location.href = user.role === 'Admin' ? '/admin' : '/';
      //    navigate(user.role === 'Admin' ? '/admin' : '/'); 
        } else {
          alert("Registration Successful! Please Login.");
          setIsLogin(true);
        }
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (err) { alert("Server Error!"); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{isLogin ? "Sign In" : "Register"}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && <input name="name" placeholder="Full Name" onChange={handleInputChange} style={styles.input} required />}
          <input name="email" type="email" placeholder="Email" onChange={handleInputChange} style={styles.input} required />
          <input name="password" type="password" placeholder="Password" onChange={handleInputChange} style={styles.input} required />
          {!isLogin && <input name="phone" placeholder="Phone Number" onChange={handleInputChange} style={styles.input} required />}
          
          <button type="submit" style={styles.button}>{isLogin ? "Login" : "Register"}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} style={styles.toggle}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', marginTop: '50px' },
  card: { padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '10px', width: '350px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' },
  toggle: { marginTop: '15px', color: '#3498db', cursor: 'pointer', textAlign: 'center' }
};

export default Auth;