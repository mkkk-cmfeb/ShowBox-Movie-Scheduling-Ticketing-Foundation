import { useState } from 'react';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const API_BASE = "http://localhost:8080/api/Auth";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const endpoint = isLogin ? `${API_BASE}/login` : `${API_BASE}/register`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // STRICT ROLE HANDLING: Hamesha UPPERCASE mein save karega
          const userRole = data.role ? data.role.toUpperCase() : "CUSTOMER";

          // LOCAL STORAGE SAVE
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            name: data.name || "Admin",
            email: data.email,
            role: userRole 
          }));

          alert(`Login Successful! Welcome, ${data.name || 'Admin'}`);
          
          // DIRECT REDIRECT (React ke caching issues ko bypass karne ke liye)
          if (userRole === "ADMIN") {
             window.location.href = "/admin";
          } else {
             window.location.href = "/";
          }
          
        } else {
          alert("Registration Successful! Please sign in now.");
          setIsLogin(true); // Switch to login screen
        }
      } else {
        setErrorMsg(data.message || "Invalid Credentials!");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setErrorMsg("Server error! Make sure Spring Boot is running.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
          {isLogin ? 'Sign In to ShowBox' : 'Create an Account'}
        </h2>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={styles.input} />
        )}
          {!isLogin && (
        <input
        type="tel"
        name="phone"
        placeholder="10-digit Phone Number"
        value={formData.phone}
          onChange={(e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: digitsOnly });
        }}
        required
        pattern="\d{10}"
        title="Enter exactly 10 digits"
        maxLength={10}
        style={styles.input}
        />
        )}
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={styles.input} />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={styles.input} />
          
          <button type="submit" style={styles.submitBtn}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8f9fa' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cccccc', fontSize: '1rem', outline: 'none' },
  submitBtn: { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  errorBox: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }
};

export default Auth;