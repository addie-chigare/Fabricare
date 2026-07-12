const run = async () => {
  try {
    const url = "https://fabri-byup.onrender.com/api/v1/auth/forgot-password";
    console.log(`Sending POST request to ${url}...`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: "adityachigare019@gmail.com" })
    });
    
    console.log("Response Status:", response.status);
    const text = await response.text();
    console.log("Response Text:", text);
  } catch (error) {
    console.error("Fetch error:", error.message);
  }
};

run();
