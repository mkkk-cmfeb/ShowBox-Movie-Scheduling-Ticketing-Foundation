import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Crowdfunding() {
  const [campaigns, setCampaigns] = useState([]);
  const [donationInputs, setDonationInputs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080/api";
  const userStr = localStorage.getItem("user");
  const loggedInUser = userStr ? JSON.parse(userStr) : null;

  // 1. Fetch campaigns from Spring Boot!
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${API_BASE}/crowdfund/campaigns`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleInputChange = (campaignId, value) => {
    setDonationInputs(prev => ({
      ...prev,
      [campaignId]: value
    }));
  };

  // Helper to load Razorpay
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 2. Process the Donation via Razorpay
  const handleDonateClick = async (campaign) => {
    const amount = parseInt(donationInputs[campaign.id]);
    
    if (!amount || amount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    if (!loggedInUser) {
      alert("Please log in to support a campaign.");
      navigate('/auth');
      return;
    }

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay failed to load. Check connection.");
        return;
      }

      // Reuse the ticketing PaymentController to generate an Order ID
      const orderResponse = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount })
      });
      const orderData = await orderResponse.json();

      const options = {
        key: "rzp_test_TMVnVixTkdMS28", // ⚠️ PASTE YOUR KEY_ID HERE
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShowBox Crowdfunding",
        description: `Backing: ${campaign.title}`,
        order_id: orderData.id,
        handler: async function (response) {
          
          // 3. On success, save to database and update progress bar!
          const donationPayload = {
            campaignId: campaign.id,
            userEmail: loggedInUser.email,
            amount: amount,
            razorpayPaymentId: response.razorpay_payment_id
          };

          const donateRes = await fetch(`${API_BASE}/crowdfund/donate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donationPayload)
          });

          if (donateRes.ok) {
            alert(`Thank you! Your donation of ₹${amount} was successful.`);
            window.location.reload(); // Refresh to show the updated progress bar
          }
        },
        prefill: {
          name: loggedInUser.name,
          email: loggedInUser.email,
        },
        theme: { color: "#2ecc71" } // Green theme to differentiate from tickets
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Donation error:", error);
    }
  };

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Loading campaigns... 🌍</h2>;

  return (
    <div style={{ backgroundColor: '#f4f4f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#2c3e50', fontSize: '2.5rem', margin: '0 0 10px 0' }}>ShowBox Crowdfunding</h1>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>Support community screenings, independent filmmakers, and theatre upgrades.</p>
        </div>

        <div style={styles.grid}>
          {campaigns.map((campaign) => {
            const progressPercentage = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);

            return (
              <div key={campaign.id} style={styles.card}>
                <img src={campaign.imageUrl} alt={campaign.title} style={styles.cardImage} />
                
                <div style={styles.cardBody}>
                  <h2 style={styles.title}>{campaign.title}</h2>
                  <p style={styles.description}>{campaign.description}</p>
                  
                  <div style={styles.progressContainer}>
                    <div style={{ ...styles.progressBar, width: `${progressPercentage}%` }}></div>
                  </div>
                  
                  <div style={styles.statsRow}>
                    <div>
                      <span style={styles.statValue}>₹ {campaign.raisedAmount?.toLocaleString() || 0}</span>
                      <span style={styles.statLabel}>Raised</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={styles.statValue}>₹ {campaign.targetAmount?.toLocaleString() || 0}</span>
                      <span style={styles.statLabel}>Target</span>
                    </div>
                  </div>

                  <div style={styles.donateAction}>
                    <span style={styles.currencySymbol}>₹</span>
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      style={styles.inputField}
                      value={donationInputs[campaign.id] || ''}
                      onChange={(e) => handleInputChange(campaign.id, e.target.value)}
                    />
                    <button onClick={() => handleDonateClick(campaign)} style={styles.donateBtn}>
                      Back this Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' },
  card: { backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardImage: { width: '100%', height: '200px', objectFit: 'cover' },
  cardBody: { padding: '25px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  title: { margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.4rem' },
  description: { margin: '0 0 25px 0', color: '#7f8c8d', lineHeight: '1.5', fontSize: '0.95rem', flexGrow: 1 },
  progressContainer: { width: '100%', height: '8px', backgroundColor: '#ecf0f1', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' },
  progressBar: { height: '100%', backgroundColor: '#2ecc71', transition: 'width 0.5s ease-in-out' },
  statsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' },
  statValue: { display: 'block', color: '#2c3e50', fontWeight: 'bold', fontSize: '1.1rem' },
  statLabel: { color: '#95a5a6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' },
  donateAction: { display: 'flex', gap: '10px', alignItems: 'center' },
  currencySymbol: { fontSize: '1.2rem', color: '#7f8c8d', fontWeight: 'bold' },
  inputField: { flex: '1', padding: '12px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '1rem', outline: 'none' },
  donateBtn: { padding: '12px 20px', backgroundColor: '#F84464', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }
};

export default Crowdfunding;