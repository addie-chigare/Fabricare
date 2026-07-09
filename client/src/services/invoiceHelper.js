/**
 * Invoice helper to dynamically write printable invoice templates to a new tab/window
 */

export const generateProductInvoice = (order, settings = null) => {
  const brandName = settings?.brandName || "Fabricare";
  const contactEmail = settings?.footerEmail || "hello@fabricare.com";
  const contactPhone = settings?.footerPhone || "+1 (555) 000-1234";
  const contactAddress = settings?.footerAddress || "123 Fabricare Towers, Fashion District, Mumbai, India";
  
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) {
    alert("Please allow pop-ups to print the invoice.");
    return;
  }

  const itemsHtml = order.items.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.product?.name || "Product Item"}</td>
      <td align="right">₹${item.product?.price?.toLocaleString() || "0"}</td>
      <td align="center">${item.quantity}</td>
      <td align="right">₹${(item.product?.price * item.quantity)?.toLocaleString() || "0"}</td>
    </tr>
  `).join("");

  const html = `
    <html>
      <head>
        <title>Invoice - ${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 24px; font-weight: 700; color: #6366f1; }
          .title { font-size: 28px; font-weight: 700; color: #0f172a; text-transform: uppercase; text-align: right; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .meta-box h4 { margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
          .meta-box p { margin: 0; font-size: 14px; color: #334155; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px 10px; font-size: 13px; text-transform: uppercase; font-weight: 700; color: #475569; }
          td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; font-size: 14px; color: #334155; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .totals-table { width: 300px; margin: 0; }
          .totals-table td { border: none; padding: 8px 10px; font-size: 14px; }
          .totals-table tr.grand { font-size: 18px; font-weight: 700; color: #6366f1; border-top: 2px solid #cbd5e1; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 60px; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">${brandName}</div>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">${contactAddress}</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Email: ${contactEmail} | Tel: ${contactPhone}</p>
          </div>
          <div>
            <div class="title">Invoice</div>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; text-align: right;">Invoice No: <strong>INV-${order._id.slice(-8).toUpperCase()}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b; text-align: right;">Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div class="meta-info">
          <div class="meta-box" style="width: 50%;">
            <h4>Bill To:</h4>
            <p><strong>${order.address?.fullName}</strong></p>
            <p>Tel: ${order.address?.phone}</p>
            <p>${order.address?.addressLine}</p>
            <p>${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}</p>
          </div>
          <div class="meta-box" style="width: 50%; text-align: right;">
            <h4>Payment Information:</h4>
            <p>Method: <strong>${order.paymentMethod}</strong></p>
            <p>Status: <strong style="color: #10b981;">${order.paymentStatus}</strong></p>
            <p>Transaction ID: ${order.transactionId || "N/A"}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th width="5%" align="left">#</th>
              <th width="55%" align="left">Item Name</th>
              <th width="15%" align="right">Unit Price</th>
              <th width="10%" align="center">Qty</th>
              <th width="15%" align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>Subtotal</td>
              <td align="right">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Shipping Fee</td>
              <td align="right">₹0</td>
            </tr>
            <tr class="grand">
              <td>Total</td>
              <td align="right">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for shopping with ${brandName}!</p>
          <p>For support, write to ${contactEmail}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  invoiceWindow.document.write(html);
  invoiceWindow.document.close();
};

export const generateLaundryInvoice = (order, settings = null) => {
  const brandName = settings?.brandName || "Fabricare";
  const contactEmail = settings?.footerEmail || "hello@fabricare.com";
  const contactPhone = settings?.footerPhone || "+1 (555) 000-1234";
  const contactAddress = settings?.footerAddress || "123 Fabricare Towers, Fashion District, Mumbai, India";
  
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) {
    alert("Please allow pop-ups to print the invoice.");
    return;
  }

  const itemsHtml = order.services?.map((service, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>Laundry Service - ${service.name.replace("_", " ").toUpperCase()}</td>
      <td align="right">₹${order.total_amount?.toLocaleString() || "0"}</td>
      <td align="center">1</td>
      <td align="right">₹${order.total_amount?.toLocaleString() || "0"}</td>
    </tr>
  `).join("");

  const html = `
    <html>
      <head>
        <title>Laundry Invoice - #${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 24px; font-weight: 700; color: #10b981; }
          .title { font-size: 28px; font-weight: 700; color: #0f172a; text-transform: uppercase; text-align: right; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .meta-box h4 { margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
          .meta-box p { margin: 0; font-size: 14px; color: #334155; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px 10px; font-size: 13px; text-transform: uppercase; font-weight: 700; color: #475569; }
          td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; font-size: 14px; color: #334155; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .totals-table { width: 300px; margin: 0; }
          .totals-table td { border: none; padding: 8px 10px; font-size: 14px; }
          .totals-table tr.grand { font-size: 18px; font-weight: 700; color: #10b981; border-top: 2px solid #cbd5e1; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 60px; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">${brandName} Laundry</div>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">${contactAddress}</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Email: ${contactEmail} | Tel: ${contactPhone}</p>
          </div>
          <div>
            <div class="title">Laundry Bill</div>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; text-align: right;">Order No: <strong>#${order.order_number}</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b; text-align: right;">Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div class="meta-info">
          <div class="meta-box" style="width: 50%;">
            <h4>Pickup Address:</h4>
            <p>${order.address}</p>
            <p>Pickup Date: <strong>${new Date(order.pickup_date).toLocaleDateString("en-IN")}</strong></p>
            <p>Pickup Slot: <strong>${order.pickup_time}</strong></p>
          </div>
          <div class="meta-box" style="width: 50%; text-align: right;">
            <h4>Order Information:</h4>
            <p>Booking Status: <strong style="color: #10b981;">${order.status.toUpperCase()}</strong></p>
            <p>Payment: <strong>COD / Post-wash Billing</strong></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th width="5%" align="left">#</th>
              <th width="55%" align="left">Service Description</th>
              <th width="15%" align="right">Rate</th>
              <th width="10%" align="center">Qty</th>
              <th width="15%" align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <table class="totals-table">
            <tr class="grand">
              <td>Total Amount Due</td>
              <td align="right">₹${order.total_amount?.toLocaleString() || "0"}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for using ${brandName} Laundry Care!</p>
          <p>For support, write to ${contactEmail}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  invoiceWindow.document.write(html);
  invoiceWindow.document.close();
};
