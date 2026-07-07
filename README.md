# Fabricare - Laundry & Fabric Care E-commerce Platform

A comprehensive full-stack application for managing fabric care, laundry services, and products.

## Project Structure
- **client**: Frontend React application built with Vite.
- **server**: Backend Node.js / Express application with MongoDB database connectivity.

---

## Features Implemented / Updated (July 7, 2026)

### 1. Category Management System
- **Backend**:
  - Defined Category Schema and Model (`server/models/category.js`).
  - Added CRUD controllers for category operations (`server/controllers/category.js`).
  - Set up category routes (`server/routes/category.routes.js`).
  - Created a database seed script for initial categories setup (`server/seedCategories.js`).
- **Frontend**:
  - Implemented the Category Management interface in the admin panel (`client/src/admin/pages/ManageCategories.jsx`).

### 2. Settings Management
- **Backend**:
  - Designed system Settings Schema and Model (`server/models/settings.js`).
  - Created Settings controller and routes (`server/controllers/settings.js`, `server/routes/settings.routes.js`).
- **Frontend**:
  - Created Admin Settings page (`client/src/admin/pages/AdminSettings.jsx`) to manage global configurations.

### 3. Order Management & Scheduling
- **Backend**:
  - Enhanced Order Model (`server/models/order.model.js`).
  - Improved Order processing controllers (`server/controllers/orderController.js`).
  - Added Order Scheduler utilities (`server/utils/orderScheduler.js`) to automate order status updates.
  - Implemented SMS helper utility (`server/utils/smsHelper.js`) for sending order tracking alerts.
- **Frontend**:
  - Implemented Admin Order interfaces: `AdminOrders.jsx` and `AdminUserOrders.jsx` to manage all orders and specific user orders.
  - Added User Orders tracking interface (`client/src/user/pages/Orders.jsx`).

### 4. Layout & UI Polish
- **Admin Section**:
  - Created/Updated layouts and styling (`client/src/admin/AdminLayout.jsx`, `client/src/admin/Admin.css`).
  - Integrated Sidebar and Topbar navigation (`client/src/admin/components/Sidebar.jsx`, `client/src/admin/components/Topbar.jsx`).
  - Added forms for creating and editing products (`client/src/admin/pages/CreateProduct.jsx`, `client/src/admin/pages/EditProduct.jsx`).
- **User Section**:
  - Refined Navbar, Footer, Home, and Products layouts.
  - Built/updated User Cart (`client/src/user/pages/Cart.jsx`).
  - Registered components in main routes (`client/src/App.jsx`).

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB

### Installation
1. Install dependencies at the root:
   ```bash
   npm install
   ```
2. Install client and server dependencies:
   ```bash
   npm install --prefix client
   npm install --prefix server
   ```

### Running the Application
- Run both Client and Server concurrently:
  ```bash
   npm run dev:all
   ```
- Run Server only:
  ```bash
   npm run dev
   ```
- Run Client only:
  ```bash
   npm run client
   ```
