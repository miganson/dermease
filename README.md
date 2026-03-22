# DermEase Online

## Design and Development of a Security-Integrated E-Commerce System for a Local Skincare Retailer

DermEase Online is a MERN-based e-commerce system created for a local skincare retailer that sells facial cleansers, moisturizers, serums, sunscreens, acne care products, and gift bundles. The project was designed from the paper's business case: the retailer originally relied on Facebook and Instagram posts, chat-based ordering, manual payment confirmation, and spreadsheet-based stock tracking. That approach was workable at very low volume, but it became unreliable as product variety and order volume increased.

This repository contains the working implementation of that proposed system using:

- `frontend`: React + Vite + TypeScript + Material UI
- `backend`: Express + TypeScript + MongoDB + Mongoose

The system centralizes product presentation, ordering, payment tracking, inventory updates, and admin visibility into one controlled transaction flow.

## 1. Project Background

DermEase Online was proposed to solve common operational problems in a small retail skincare business:

- product information was scattered across social media posts
- customers had to ask repeatedly if items were available
- orders were collected manually through chat
- payment verification happened outside the ordering flow
- stock records were maintained separately in spreadsheets
- the owner had weak visibility into orders, inventory, and sales

The deeper problem was not only the absence of a website. The real issue was the use of disconnected tools for activities that should happen within one synchronized process.

This implementation follows that paper's central idea:

`Browse products -> Add to cart -> Check out -> Choose payment -> Confirm order -> Update stock -> Track order`

## 2. Purpose of the System

The system was built to:

- reduce manual order handling
- improve customer browsing and checkout experience
- prevent incomplete orders
- improve stock visibility and reduce overselling
- attach payment activity directly to orders
- provide admin control, audit visibility, and reporting

## 3. Methodology Reflected From the Paper

The README is not only a technical guide; it also reflects the logic of the paper.

### Systems Initiation and Preliminary Investigation

The project starts from the business problem, not from code. The retailer already had product discovery through social media, so the system focuses on transaction reliability, stock control, and admin visibility rather than online presence alone.

### TELOS Feasibility Analysis

The proposed system is feasible because:

- `Technical`: the features are standard for a small e-commerce platform
- `Economic`: it reduces manual work and order errors
- `Legal`: it supports privacy and transaction record-keeping
- `Operational`: it matches the workflow of a small owner-managed business
- `Schedule`: it can be built in phased modules

### Security-Integrated Requirements

Security was treated as part of analysis and design, not something added at the end. In this implementation, that appears as:

- JWT-based authentication
- role-based admin access
- password hashing with `bcryptjs`
- audit logs for important actions
- controlled inventory adjustments
- order and payment status tracking
- environment-based secret management
- MongoDB database scoping using `MONGODB_DB_NAME=school`

## 4. System Scope

### Customer-side functions

- browse product catalog
- search and filter products
- view product details
- add items to cart
- review cart and quantities
- sign up with data privacy consent
- sign in with validated credentials
- request a mock password reset code
- reset password through a database-backed mock flow
- check out with delivery details
- create a payment session using a mock gateway-ready flow
- track order and payment status
- view account and recent orders
- edit profile details

### Admin-side functions

- view dashboard metrics
- create and update products
- upload product images through Cloudinary
- monitor inventory
- perform stock adjustments with remarks
- review and update order statuses
- view payment activity
- view audit logs
- access reports for sales, stock, orders, payments, and product performance

## 5. Implemented Core Modules

### Product Catalogue

The catalog is the storefront of the system. It displays product image, name, category, price, short description, and stock status. It addresses one of the biggest problems in the paper: customers no longer need to ask repeatedly about what is available.

If a product image fails to load, the frontend automatically renders a generated placeholder image so the catalog and product pages stay visually usable during demos.

### Online Ordering

The cart and checkout flow standardize the order process. Instead of relying on chat messages, the system captures order data in a structured way.

### Simple Inventory

Inventory is intentionally simple, in line with the paper. The system reduces stock when an order is placed and restores stock when an order is cancelled. If a payment fails in the mock payment module, the linked order is cancelled and the reserved stock is restored automatically. Manual stock adjustments require remarks for accountability.

### Checkout

Checkout collects only the essential fulfillment details:

- recipient name
- contact number
- delivery address
- payment method
- optional notes

This keeps the process simple while reducing incomplete orders.

### Payment

The current implementation uses a gateway-ready mock payment flow. It does not yet connect to a live payment provider, but it preserves the architecture needed for later gateway integration:

- create payment session
- store payment transaction reference
- collect mock debit or credit card details for card payments
- simulate redirect flow for Visa or Mastercard
- simulate success or failure
- sync payment result with the linked order
- restore reserved stock automatically when payment fails

### Account Management and Password Reset

The project now includes a fuller account module for demo purposes:

- customer registration
- login
- profile editing
- mock forgot-password request
- database-backed password reset using a generated 6-digit reset code

The forgot-password feature is intentionally mock. Instead of sending an email, the system generates a reset code, stores it in the database with an expiry time, and displays it on screen so the full recovery flow can still be demonstrated in class or in a project defense.

### Reporting

Reports are included because transaction visibility was a major weakness in the old workflow. Admin users can access:

- daily sales
- monthly sales
- inventory status
- low-stock products
- order status summary
- payment summary
- product performance

## 6. Security and Control Features

This project follows the paper's security-integrated approach by embedding control and accountability into the flow itself.

Implemented controls include:

- hashed passwords using `bcryptjs`
- JWT access and refresh token flow
- protected customer and admin routes
- admin-only product, inventory, order, and report actions
- audit log entries for major actions
- payment records linked directly to orders
- stock deduction inside the order creation flow
- stock restoration when orders are cancelled
- stock restoration when payment fails
- form validation on both frontend and backend
- stronger password requirements for signup and password reset
- data privacy consent checkbox during signup
- secret values stored in `.env`, not in source files

## 7. Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Material UI
- React Router
- TanStack Query
- React Hook Form
- Zod

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod
- JWT
- bcryptjs
- Multer
- Cloudinary

## 8. Project Structure

```text
Design/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- data/
|   |   |-- lib/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- scripts/
|   |   |-- services/
|   |   |-- types/
|   |   `-- utils/
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- styles/
|   |   `-- types/
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.ts
|-- .gitignore
`-- README.md
```

## 9. Important Business Rule in This Repo

The backend is intentionally restricted to the `school` MongoDB database.

Why this matters:

- your MongoDB cluster may contain other databases
- this project should only read and write inside `school`
- sharing the repo should not require other people to use your exact local database

This is enforced using:

- `MONGODB_URI`
- `MONGODB_DB_NAME=school`

The backend passes `dbName` explicitly to Mongoose, so the app is scoped to the correct database even when the cluster URI can access more than one.

## 10. Environment Variables

Real secrets belong in `.env`. Only `.env.example` should be committed.

### Backend `.env`

File: [`backend/.env.example`](backend/.env.example)

| Variable | Purpose |
|---|---|
| `PORT` | API server port |
| `CLIENT_URL` | frontend origin for CORS |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | database name, set to `school` |
| `JWT_ACCESS_SECRET` | access token signing secret |
| `JWT_REFRESH_SECRET` | refresh token signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `LOW_STOCK_THRESHOLD` | default low-stock warning level |
| `FLAT_SHIPPING_FEE` | flat shipping fee used at checkout |
| `SEED_ADMIN_EMAIL` | admin account created by the seed script |
| `SEED_ADMIN_PASSWORD` | admin password used by the seed script |

### Frontend `.env`

File: [`frontend/.env.example`](frontend/.env.example)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | base URL of the backend API |
| `VITE_APP_NAME` | app name shown in the interface |
| `VITE_DEMO_PAYMENT_MODE` | label for the current mock payment mode |

## 11. Setup Guide

### Prerequisites

Install the following first:

- Node.js 20+ or newer
- npm
- a MongoDB database or MongoDB Atlas connection
- a Cloudinary account for product image uploads

### Step 1: Clone the repository

```bash
git clone https://github.com/miganson/dermease.git
cd dermease
```

If your local folder name is still `Design`, that is fine too. The commands below work from the project root.

### Step 2: Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### Step 3: Create environment files

Create:

- `backend/.env`
- `frontend/.env`

Copy the matching values from:

- `backend/.env.example`
- `frontend/.env.example`

### Step 4: Configure MongoDB safely

Use a MongoDB connection string in `backend/.env`, but keep:

```env
MONGODB_DB_NAME=school
```

This ensures the application works only inside the `school` database.

### Step 5: Configure Cloudinary

To support product image uploads from the admin panel, fill in:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Step 6: Seed the starter data

From the backend folder:

```bash
npm run seed
```

This creates:

- the initial admin account using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`
- starter skincare products for the storefront

### Step 7: Start the backend server

From `backend`:

```bash
npm run dev
```

Expected local API:

```text
http://localhost:5000
```

### Step 8: Start the frontend server

From `frontend`:

```bash
npm run dev
```

Expected local app:

```text
http://localhost:5173
```

## 12. Demo Flow

### Customer demo flow

1. Open the storefront
2. Browse products on the home page
3. Filter by category or search by keyword
4. Open a product details page
5. Add items to cart
6. Sign up with data privacy consent and the required password rules
7. Sign in
8. Optionally open the mock forgot-password page, generate a reset code, and reset the password
9. Complete checkout
10. Continue to the mock payment page
11. If `Debit / Credit Card` is selected, enter mock Visa or Mastercard details
12. Simulate payment success or failure
13. Open the orders page to track status
14. Open the account page to update profile details

### Admin demo flow

1. Sign in using the seeded admin credentials
2. Open `/admin`
3. Review dashboard metrics
4. Add or edit products
5. Upload product images
6. Review inventory and apply stock adjustments
7. Update order status
8. Review reports and audit visibility

## 13. Main API Groups

The backend organizes functionality into these route groups:

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payments`
- `/api/admin`
- `/api/reports`

These correspond directly to the system modules described in the paper.

## 14. Available Pages in the Frontend

### Storefront and customer pages

- Home page
- Product details page
- Cart page
- Checkout page
- Payment result page
- Login page
- Register page
- Forgot password page
- Account page
- Order tracking page

### Admin pages

- Dashboard
- Product management
- Inventory page
- Order management
- Reports page

## 15. Build and Test Commands

### Backend

```bash
npm run dev
npm run build
npm run seed
npm run test
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run test
```

## 16. Notes for Sharing the Repository

If you share this repo with classmates, teammates, or instructors:

- do not commit real `.env` files
- do not commit real MongoDB credentials
- do not commit real Cloudinary credentials
- let each user create their own `.env`
- if using Atlas, give them their own connection string or shared access
- keep `MONGODB_DB_NAME=school` so the project stays within the correct database

## 17. Current Limitations

This build already covers the main modules from the paper, but some future improvements remain out of scope for this version:

- live payment gateway integration
- real email delivery for forgot password
- promo codes and discount rules
- customer reviews and ratings
- courier API integration
- email or SMS notifications
- customer analytics
- multi-role admin permissions
- advanced inventory forecasting
- mobile app support

These match the paper's recommendation for future expansion after the core web system is stable.

## 18. Conclusion

DermEase Online shows how a small retailer can move from fragmented, manual selling to an integrated transaction system. In line with the paper, the system is not just a storefront. It is a controlled business process that improves:

- order accuracy
- customer convenience
- payment visibility
- stock control
- admin accountability

The implementation in this repository translates the paper's proposed solution into a working MERN application that can be demonstrated, extended, and evaluated as an academic systems project.
