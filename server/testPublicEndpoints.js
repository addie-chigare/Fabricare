const test = async () => {
  const endpoints = [
    "/products/public",
    "/banners/public",
    "/settings",
    "/categories"
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:8000/api/v1${ep}`);
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
};

test();
