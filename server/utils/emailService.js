import nodemailer from "nodemailer";

const sendEmailViaBrevo = async (email, subject, htmlContent) => {
  const senderEmail = process.env.SMTP_SENDER || process.env.SMTP_USER || "support@fabricare.com";
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Fabricare Support", email: senderEmail },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Brevo returned status ${response.status}`);
    }
    console.log(`[Brevo Email] Status email sent successfully to ${email}. ID: ${data.messageId || data.id}`);
    return true;
  } catch (err) {
    console.error(`[Brevo Email Error] Failed to send email to ${email}:`, err.message);
    throw new Error(`Could not send email via Brevo: ${err.message}`);
  }
};

const sendMail = async (email, subject, htmlContent) => {
  if (process.env.BREVO_API_KEY) {
    return await sendEmailViaBrevo(email, subject, htmlContent);
  }

  let transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[SMTP] Created temporary Ethereal account: ${testAccount.user}`);
    } catch (err) {
      console.error("Failed to create Ethereal SMTP account. Falling back to console log.", err.message);
      return null;
    }
  }

  const mailOptions = {
    from: `"Fabricare Support" <${process.env.SMTP_SENDER || process.env.SMTP_USER || "support@fabricare.com"}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Status email sent to ${email}. Message ID: ${info.messageId}`);
    
    if (!process.env.SMTP_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[SMTP Demo] Preview Sent Email URL: ${previewUrl}`);
      return previewUrl;
    }
    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send status email to ${email}:`, err.message);
    return null;
  }
};

/**
 * Send an email notification for a storefront product order
 */
export const sendOrderNotificationEmail = async (userEmail, userName, order, status) => {
  const subject = `Fabricare Order Status Update: ${status} (Order #${order._id.toString().slice(-8).toUpperCase()})`;
  
  let statusBadgeColor = "#6366f1";
  let statusMessage = "";

  switch (status.toLowerCase()) {
    case "pending":
      statusBadgeColor = "#f59e0b";
      statusMessage = "Your order has been placed and is currently pending payment confirmation.";
      break;
    case "confirmed":
      statusBadgeColor = "#10b981";
      statusMessage = "Thank you! Your payment has been confirmed, and your order is now being processed.";
      break;
    case "shipped":
      statusBadgeColor = "#3b82f6";
      statusMessage = "Great news! Your package has been handed over to our delivery partner and is on its way to you.";
      break;
    case "delivered":
      statusBadgeColor = "#10b981";
      statusMessage = "Your package has been successfully delivered. We hope you love your new garments!";
      break;
    case "cancelled":
      statusBadgeColor = "#ef4444";
      statusMessage = "Your order has been cancelled. If this was a mistake or you have refund queries, please contact support.";
      break;
    default:
      statusMessage = `Your order status has been updated to: ${status}.`;
  }

  const itemsListHtml = (order.items || []).map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-size: 14px;">${item.product?.name || "Product Item"}</td>
      <td style="padding: 10px; font-size: 14px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; font-size: 14px; text-align: right;">₹${(item.product?.price * item.quantity)?.toLocaleString()}</td>
    </tr>
  `).join("");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0; font-weight: 700; font-size: 26px;">Fabricare</h2>
        <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Premium Apparel & Garment Care</span>
      </div>
      
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">${statusMessage}</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusBadgeColor}; margin: 20px 0;">
        <h4 style="margin: 0 0 5px 0; color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Order Details:</h4>
        <p style="margin: 3px 0; font-size: 13px;">Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <p style="margin: 3px 0; font-size: 13px;">Status: <span style="color: ${statusBadgeColor}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
        <p style="margin: 3px 0; font-size: 13px;">Payment Method: <strong>${order.paymentMethod}</strong></p>
      </div>

      <h4 style="margin: 20px 0 10px 0; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Order Summary:</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; font-size: 13px; text-align: left; color: #475569; font-weight: bold;">Item Description</th>
            <th style="padding: 10px; font-size: 13px; text-align: center; color: #475569; font-weight: bold;">Qty</th>
            <th style="padding: 10px; font-size: 13px; text-align: right; color: #475569; font-weight: bold;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
          <tr>
            <td colspan="2" style="padding: 10px; font-size: 14px; font-weight: bold; text-align: right;">Grand Total:</td>
            <td style="padding: 10px; font-size: 15px; font-weight: bold; text-align: right; color: #6366f1;">₹${order.totalAmount?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 13px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; line-height: 1.5;">
        <p>If you have any questions or feedback, feel free to contact us at <a href="mailto:support@fabricare.com" style="color: #6366f1; text-decoration: none;">support@fabricare.com</a>.</p>
        <p style="text-align: center; font-size: 11px; margin-top: 20px; color: #cbd5e1;">&copy; ${new Date().getFullYear()} Fabricare Inc. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendMail(userEmail, subject, htmlContent);
};

/**
 * Send an email notification for a laundry service order
 */
export const sendLaundryNotificationEmail = async (userEmail, userName, order, status) => {
  const subject = `Fabricare Laundry Update: Order #${order.order_number} is now ${status.replace("_", " ").toUpperCase()}`;
  
  let statusBadgeColor = "#10b981";
  let statusMessage = "";

  switch (status.toLowerCase()) {
    case "pending":
      statusBadgeColor = "#f59e0b";
      statusMessage = "Your laundry pickup has been scheduled! We will arrive during your selected pickup time slot.";
      break;
    case "confirmed":
      statusBadgeColor = "#6366f1";
      statusMessage = "Your booking is confirmed! Our laundry valet will be picking up your clothes shortly.";
      break;
    case "picked_up":
      statusBadgeColor = "#3b82f6";
      statusMessage = "Your garments have been successfully picked up and are arriving at our processing center.";
      break;
    case "washing":
      statusBadgeColor = "#3b82f6";
      statusMessage = "Your garments are currently undergoing professional washing using premium, eco-friendly detergents.";
      break;
    case "ironing":
      statusBadgeColor = "#3b82f6";
      statusMessage = "Washing complete! Your garments are now in the premium steam ironing and press phase.";
      break;
    case "ready_for_delivery":
      statusBadgeColor = "#10b981";
      statusMessage = "Excellent! Your clothes are washed, pressed, and ready. Our delivery valet is heading your way.";
      break;
    case "delivered":
      statusBadgeColor = "#10b981";
      statusMessage = "Your fresh, crisp garments have been successfully delivered to your doorstep. Thank you for choosing Fabricare!";
      break;
    case "cancelled":
      statusBadgeColor = "#ef4444";
      statusMessage = "Your laundry booking has been cancelled. Let us know if you need to reschedule a fresh pickup.";
      break;
    default:
      statusMessage = `Your laundry order status has been updated to: ${status.replace("_", " ").toUpperCase()}.`;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin: 0; font-weight: 700; font-size: 26px;">Fabricare Laundry</h2>
        <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Smart & Eco-Friendly Garment Care</span>
      </div>
      
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">${statusMessage}</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusBadgeColor}; margin: 20px 0;">
        <h4 style="margin: 0 0 5px 0; color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Booking details:</h4>
        <p style="margin: 3px 0; font-size: 13px;">Booking ID: <strong>#${order.order_number}</strong></p>
        <p style="margin: 3px 0; font-size: 13px;">Status: <span style="color: ${statusBadgeColor}; font-weight: bold; text-transform: uppercase;">${status.replace("_", " ")}</span></p>
        <p style="margin: 3px 0; font-size: 13px;">Pickup Slot: <strong>${new Date(order.pickup_date).toLocaleDateString("en-IN")} (${order.pickup_time})</strong></p>
        <p style="margin: 3px 0; font-size: 13px;">Total Amount: <strong>₹${order.total_amount || "TBD (post-wash weigh-in)"}</strong></p>
      </div>

      <div style="font-size: 13px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; line-height: 1.5;">
        <p>If you need to reschedule or have support queries, contact us at <a href="mailto:support@fabricare.com" style="color: #10b981; text-decoration: none;">support@fabricare.com</a>.</p>
        <p style="text-align: center; font-size: 11px; margin-top: 20px; color: #cbd5e1;">&copy; ${new Date().getFullYear()} Fabricare Inc. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendMail(userEmail, subject, htmlContent);
};
