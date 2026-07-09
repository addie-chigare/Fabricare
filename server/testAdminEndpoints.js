const test = async () => {
  try {
    // Login as admin
    const loginRes = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin@fabricare.com",
        password: "adminpassword"
      })
    });
    
    if (!loginRes.ok) {
      console.error("Login failed:", loginRes.status, await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in successfully. Token obtained.");

    const headers = { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const endpoints = [
      "/products/all",
      "/admin/users",
      "/orders/admin",
      "/orders/dashboard/stats",
      "/orders/dashboard/revenue",
      "/orders/dashboard/pending",
      "/orders/dashboard/top-products"
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(`http://localhost:8000/api/v1${ep}`, { headers });
        if (res.ok) {
          console.log(`✅ GET ${ep} - Success (Status 200)`);
        } else {
          console.log(`❌ GET ${ep} - Failed (Status ${res.status})`);
          console.log("Response text:", await res.text());
        }
      } catch (err) {
        console.log(`❌ GET ${ep} - Fetch Exception:`, err.message);
      }
    }
  } catch (err) {
    console.error("Test script failed:", err.message);
  }
};

test();
