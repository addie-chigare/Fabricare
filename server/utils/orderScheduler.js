import Order from "../models/order.model.js";
import { sendSMS } from "./smsHelper.js";

/**
 * Starts the background order scheduler.
 * Runs at a fixed interval to transition orders from 'Pending' or 'Confirmed' to 'Shipped'
 * after the timeout (defaults to 24 hours, configurable via ORDER_AUTO_SHIP_TIMEOUT_MS).
 */
export const startOrderScheduler = () => {
  const checkInterval = 60 * 1000; // Check every 1 minute
  const timeoutMs = parseInt(process.env.ORDER_AUTO_SHIP_TIMEOUT_MS) || 24 * 60 * 60 * 1000;

  console.log(`[SCHEDULER] Order auto-ship scheduler started.`);
  console.log(`[SCHEDULER] Query interval: ${checkInterval}ms | Order age cutoff: ${timeoutMs}ms (${(timeoutMs / (1000 * 60 * 60)).toFixed(2)} hours).`);

  const runCheck = async () => {
    try {
      const currentTimeoutMs = parseInt(process.env.ORDER_AUTO_SHIP_TIMEOUT_MS) || 24 * 60 * 60 * 1000;
      const cutoffTime = new Date(Date.now() - currentTimeoutMs);

      // Fetch orders that are Pending or Confirmed and older than the cutoff time
      const ordersToShip = await Order.find({
        status: { $in: ["Pending", "Confirmed"] },
        createdAt: { $lte: cutoffTime }
      });

      if (ordersToShip.length > 0) {
        console.log(`[SCHEDULER] Found ${ordersToShip.length} order(s) qualifying for auto-shipment.`);

        for (const order of ordersToShip) {
          const oldStatus = order.status;
          order.status = "Shipped";
          order.shippedAt = new Date();
          await order.save();

          console.log(`[SCHEDULER] Order #${order._id} transitioned automatically: ${oldStatus} -> Shipped.`);

          // Dispatch SMS message
          if (order.address && order.address.phone) {
            try {
              const orderIdSuffix = order._id.toString().slice(-8).toUpperCase();
              const message = `Dear Customer, your order #${orderIdSuffix} has been shipped successfully! (tumchi order Shipped state madhe ata ahe)`;
              sendSMS(order.address.phone, message);
            } catch (smsErr) {
              console.error(`[SCHEDULER ERROR] Failed to send SMS for order #${order._id}:`, smsErr.message);
            }
          }
        }
      }
    } catch (err) {
      console.error("[SCHEDULER ERROR] Exception in auto-ship runner:", err.message);
    }
  };

  // Run check immediately on start
  runCheck();

  // Run check periodically
  setInterval(runCheck, checkInterval);
};
