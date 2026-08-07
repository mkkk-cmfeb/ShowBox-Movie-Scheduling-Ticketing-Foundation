import { useState, useEffect } from 'react';

function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  
  // New States for Dropdowns
  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const [theatres, setTheatres] = useState([]);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    targetAmount: '',
    imageUrl: '',
    movieId: '',
    cityId: '',
    theatreId: ''
  });

  const API_BASE = "http://localhost:8080/api";

  // Fetch all required data on load
  const fetchData = async () => {
    try {
      const [campRes, movRes, citRes, theaRes] = await Promise.all([
        fetch(`${API_BASE}/crowdfund/campaigns`),
        fetch(`${API_BASE}/Movies`),
        fetch(`${API_BASE}/Cities`),
        fetch(`${API_BASE}/Theatres`)
      ]);
      
      if (campRes.ok) setCampaigns(await campRes.json());
      if (movRes.ok) setMovies(await movRes.json());
      if (citRes.ok) setCities(await citRes.json());
      if (theaRes.ok) setTheatres(await theaRes.json());
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Form Submit
  const handleAddCampaign = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/crowdfund/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign)
      });

      if (response.ok) {
        alert("Campaign added successfully!");
        setNewCampaign({ 
          title: '', description: '', targetAmount: '', imageUrl: '', 
          movieId: '', cityId: '', theatreId: '' 
        }); 
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding campaign", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const response = await fetch(`${API_BASE}/crowdfund/campaigns/${id}`, { method: "DELETE" });
      if (response.ok) fetchData();
    } catch (error) {
      console.error("Error deleting campaign", error);
    }
  };

  // Filter theatres dynamically based on selected city
  const availableTheatres = theatres.filter(t => t.cityId.toString() === newCampaign.cityId.toString());

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Add New Movie Campaign</h2>
      
      <form onSubmit={handleAddCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px', marginBottom: '40px' }}>
        
        {/* NEW: Movie Dropdown */}
        <select 
          value={newCampaign.movieId}
          onChange={(e) => setNewCampaign({...newCampaign, movieId: e.target.value})}
          style={styles.input}
          required
        >
          <option value="" disabled>-- Select a Movie --</option>
          {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>

        {/* NEW: City & Theatre Dropdowns Side-by-Side */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <select 
            value={newCampaign.cityId}
            onChange={(e) => setNewCampaign({...newCampaign, cityId: e.target.value, theatreId: ''})}
            style={{ ...styles.input, flex: 1 }}
            required
          >
            <option value="" disabled>-- Select City --</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select 
            value={newCampaign.theatreId}
            onChange={(e) => setNewCampaign({...newCampaign, theatreId: e.target.value})}
            style={{ ...styles.input, flex: 1, backgroundColor: newCampaign.cityId ? 'white' : '#ecf0f1' }}
            disabled={!newCampaign.cityId}
            required
          >
            <option value="" disabled>-- Select Theatre --</option>
            {availableTheatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <input 
          type="text" 
          placeholder="Campaign Title (e.g., Bring Interstellar to IMAX)" 
          value={newCampaign.title}
          onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
          style={styles.input}
          required
        />
        <textarea 
          placeholder="Describe the event and why you need funding..." 
          value={newCampaign.description}
          onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
          style={{ ...styles.input, height: '100px', resize: 'vertical' }}
          required
        />
        <input 
          type="number" 
          placeholder="Target Amount (₹)" 
          value={newCampaign.targetAmount}
          onChange={(e) => setNewCampaign({...newCampaign, targetAmount: e.target.value})}
          style={styles.input}
          required
        />
        <input 
          type="text" 
          placeholder="Image URL" 
          value={newCampaign.imageUrl}
          onChange={(e) => setNewCampaign({...newCampaign, imageUrl: e.target.value})}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.saveBtn}>Save Campaign</button>
      </form>

      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Active Campaigns ({campaigns.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {campaigns.map(campaign => {
          // Look up the names to display them nicely in the list
          const movieName = movies.find(m => m.id.toString() === campaign.movieId?.toString())?.title || 'Unknown Movie';
          const cityName = cities.find(c => c.id.toString() === campaign.cityId?.toString())?.name || 'Unknown City';
          
          return (
            <div key={campaign.id} style={styles.campaignRow}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#34495e' }}>{campaign.title}</h4>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                  <strong>{movieName}</strong> • {cityName} <br/>
                  Target: ₹{campaign.targetAmount} | Raised: ₹{campaign.raisedAmount || 0}
                </p>
              </div>
              <button onClick={() => handleDelete(campaign.id)} style={styles.deleteBtn}>
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  input: { padding: '12px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '1rem', outline: 'none' },
  saveBtn: { padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
  campaignRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #3498db', borderRadius: '5px' },
  deleteBtn: { padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ManageCampaigns;