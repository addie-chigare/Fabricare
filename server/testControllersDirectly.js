import mongoose from "mongoose";
import { 
  getDashboardStats, 
  getMonthlyRevenue, 
  getPendingOrders, 
  getTopProducts 
} from "./controllers/orderController.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const test = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const mockReq = {
      user: { role: "admin", id: "mockadminid" },
      params: {}
    };

    const runController = async (name, fn) => {
      console.log(`\n--- Running ${name} ---`);
      return new Promise((resolve) => {
        const mockRes = {
          status: (code) => {
            console.log(`[STATUS] : ${code}`);
            return {
              json: (data) => {
                console.log(`[ERROR RESPONSE] :`, data);
                resolve();
              }
            };
          },
          json: (data) => {
            console.log(`[SUCCESS RESPONSE] :`, typeof data === 'object' ? 'JSON Data returned successfully' : data);
            resolve();
          }
        };
        
        fn(mockReq, mockRes).catch((err) => {
          console.error(`[EXCEPTION in ${name}] :`, err);
          resolve();
        });
      });
    };

    await runController("getDashboardStats", getDashboardStats);
    await runController("getMonthlyRevenue", getMonthlyRevenue);
    await runController("getPendingOrders", getPendingOrders);
    await runController("getTopProducts", getTopProducts);

    console.log("\nAll tests completed.");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};

test();
