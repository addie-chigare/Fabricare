/**
 * Mock SMS Sending Helper
 * Integrates with standard console output for local debugging.
 * In a production environment, this can be integrated with Twilio, Vonage, MSG91, etc.
 * 
 * @param {string} phone - The recipient's registered mobile number.
 * @param {string} message - The message payload to send.
 * @returns {boolean} - Returns true if the message was successfully dispatched.
 */
export const sendSMS = (phone, message) => {
  console.log("\n=================== SMS GATEWAY SIMULATION ===================");
  console.log(`[TIMESTAMP] : ${new Date().toISOString()}`);
  console.log(`[TO]        : ${phone}`);
  console.log(`[MESSAGE]   : ${message}`);
  console.log("==============================================================\n");
  return true;
};
