# 🛒 CartNOW — Enterprise Multi-Portal E-Commerce Platform

<p align="center">
  <img src="client/src/assets/logo.png" alt="CartNOW Logo" width="220" />
</p>

<p align="center">
  <strong>A modern, high-performance e-commerce ecosystem featuring AI Virtual Try-On, real-time Co-Shopping, multi-vendor seller management, live delivery dispatch, and administrative analytics.</strong>
</p>

<p align="center">
  <a href="#-architecture"><img src="https://img.shields.io/badge/Architecture-Distributed%20Microservices-blue.svg?style=for-the-badge" alt="Architecture" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Node.js-v18+-68a063.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React-v19-61dafb.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/MongoDB-v6+-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Socket.io-Real--Time-010101.svg?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" /></a>
  <a href="#-security--hardening"><img src="https://img.shields.io/badge/Security-Hardened%20%26%20Zero--Leak-success.svg?style=for-the-badge&logo=securityscorecard&logoColor=white" alt="Security Hardened" /></a>
  <a href="#-license"><img src="https://img.shields.io/badge/License-ISC-orange.svg?style=for-the-badge" alt="License" /></a>
</p>

---

## 📑 Table of Contents

- [Overview & Value Proposition](#-overview--value-proposition)
- [Key Features by Portal](#-key-features-by-portal)
  - [1. Customer Storefront](#1-customer-storefront-client)
  - [2. Multi-Vendor Seller Portal](#2-multi-vendor-seller-portal-seller)
  - [3. Delivery Partner Operations](#3-delivery-partner-operations-deliveryman)
  - [4. Central Admin Control Tower](#4-central-admin-control-tower-admin)
  - [5. AI & Real-Time Engine](#5-ai--real-time-engine-server--ai-service)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites & System Requirements](#-prerequisites--system-requirements)
- [Quickstart & Installation](#-quickstart--installation)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Environment Configuration](#2-environment-configuration-safe-templates)
  - [3. Backend Server Setup](#3-backend-server-setup)
  - [4. AI Microservice Setup (Optional)](#4-ai-microservice-setup-virtual-try-on)
  - [5. Client & Dashboards Setup](#5-client--dashboards-setup)
- [Environment Variables Reference](#-environment-variables-reference)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Database Seeders & Utility Scripts](#-database-seeders--utility-scripts)
- [Security & Hardening Policy](#-security--hardening-policy)
  - [Zero Credential Exposure](#zero-credential-exposure-policy)
  - [HTTP Security Headers](#http-security-headers)
  - [Authentication & RBAC](#authentication--rbac)
  - [Vulnerability Reporting](#reporting-security-vulnerabilities)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview & Value Proposition

**CartNOW** is a comprehensive, production-grade e-commerce monorepo built with a modern decoupled architecture. It bridges customers, merchants, logistics personnel, and administrators through a cohesive network of dedicated web applications, an Express API gateway, asynchronous worker queues, and an OpenCV/FastAPI computer vision microservice.

Unlike standard e-commerce templates, CartNOW features:
- **Interactive Co-Shopping:** Real-time synchronized browsing, shared cart updates, and collaborative decision making powered by Socket.IO.
- **AI-Powered Virtual Try-On:** Background image segmentation and garment projection utilizing BullMQ queues and computer vision pipelines.
- **Integrated Social Commerce:** Interactive consumer feeds, story carousels, customer reviews with media attachments, and vendor replies.
- **Zero-Latency In-Transit Chat:** Secure direct messaging between buyers and delivery agents during active order fulfillment.

---

## 🚀 Key Features by Portal

### 1. Customer Storefront (`/client`)
- **Fluid UI & Performance:** Built with React 19, Vite, Tailwind CSS v4, Framer Motion transitions, and Lenis smooth scrolling.
- **Catalog Navigation:** Dynamic category hierarchy, faceted attribute filtering (size, color, brand, price range), and instant search.
- **Real-Time Co-Shopping:** Invite friends to shared shopping sessions with room-based live cart synchronizations.
- **AI Virtual Try-On:** Interactive modal to preview apparel fittings directly on user-uploaded photos.
- **Multi-Gateway Checkout:** Integrated Stripe card payments, Razorpay checkout, and Cash on Delivery (COD).
- **Automated Digital Invoicing:** Instant PDF generation via PDFKit with instant download and direct email delivery.
- **Security & Social Login:** One-tap Google OAuth 2.0 and JWT token storage.

### 2. Multi-Vendor Seller Portal (`/seller`)
- **Inventory & Variant Engine:** Add, update, and categorize products with multi-image Cloudinary CDN uploads and inventory SKU alerts.
- **Order Pipeline:** Live order fulfillment dashboard with status progression (`Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Revenue Analytics:** Daily/weekly revenue statistics, top-selling items, and stock depletion monitors.
- **Customer Feedback Hub:** Monitor customer ratings and publish verified merchant responses.

### 3. Delivery Partner Operations (`/deliveryman`)
- **Order Dispatch Board:** Real-time assignment notifications for nearby ready-to-deliver packages.
- **Delivery Milestone Tracker:** In-transit GPS tracking status, one-tap transit progression, and delivery verification.
- **Buyer Direct Messaging:** Real-time Socket.IO chat with buyers for address clarification and milestone coordination.

### 4. Central Admin Control Tower (`/admin`)
- **Executive Analytics:** Interactive charts powered by Recharts (gross transaction volume, customer acquisition, vendor growth).
- **Taxonomy & Campaign Management:** Banner carousel controls, time-limited "Deal of the Day" flash sales, and discount coupons.
- **Maintenance Mode Switch:** Instantly toggle global or partial platform maintenance mode with bypass keys.
- **Returns & RMS:** Return Merchandise Authorization (RMA) ticket workflow, refund authorization, and inspection audits.

### 5. AI & Real-Time Engine (`/server` & `/server/ai-service`)
- **FastAPI Vision Microservice:** Python 3.10+ service utilizing OpenCV, Pillow, and NumPy for apparel masking and garment warp fitting.
- **BullMQ + Redis Task Queue:** Offloads heavy image transformations, AI tasks, and automated cron reconciliations.
- **Socket.IO Cluster Support:** Scalable socket state architecture with `@socket.io/redis-adapter` for multi-node deployments.

---

## 📐 System Architecture

```mermaid
flowchart TB
    subgraph ClientApplications [Frontend Applications (React 19 + Vite)]
        Client["🛒 Customer Storefront\n(Port 5173)"]
        Admin["📊 Admin Dashboard\n(Port 5174)"]
        Seller["🏪 Seller Portal\n(Port 5175)"]
        Delivery["🚚 Delivery Partner\n(Port 5176)"]
    end

    subgraph Gateway [Express 5 API Gateway (Port 4000)]
        SecurityHeaders["🛡️ Security Middleware\n(HSTS, CSP, COOP, CORS)"]
        AuthMiddleware["🔑 JWT & RBAC Auth"]
        APIRouters["⚡ Modular REST Routers\n(/api/user, /api/order, /api/product...)"]
        SocketServer["📡 Socket.IO Real-Time Server"]
    end

    subgraph AsyncInfrastructure [Asynchronous & Worker Layer]
        Redis[("⚡ Redis Cache & Pub/Sub\n(Port 6379)")]
        BullMQWorker["⚙️ BullMQ Try-On Worker"]
        AIService["🧠 Python FastAPI Vision Service\n(Port 8000)"]
    end

    subgraph DataAndExternal [Persistence & Third-Party APIs]
        MongoDB[("🍃 MongoDB Database")]
        Cloudinary["☁️ Cloudinary Media CDN"]
        Payments["💳 Stripe & Razorpay Gateways"]
        GoogleAuth["🌐 Google Cloud OAuth 2.0"]
        GeminiAI["✨ Google Gemini AI Engine"]
    end

    ClientApplications -->|HTTP Requests| SecurityHeaders
    ClientApplications <-->|WebSockets| SocketServer

    SecurityHeaders --> AuthMiddleware --> APIRouters
    APIRouters --> MongoDB
    APIRouters --> Cloudinary
    APIRouters --> Payments
    APIRouters --> GoogleAuth
    APIRouters --> GeminiAI

    SocketServer <--> Redis
    APIRouters --> BullMQWorker
    BullMQWorker <--> Redis
    BullMQWorker <--> AIService
```

---

## 🛠️ Tech Stack

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Frontend Frameworks** | React 19, Vite 7/8, React Router v7, Zustand, Framer Motion, Lenis Smooth Scroll |
| **Styling & UI** | Tailwind CSS v4, Lucide React, React Icons, React Toastify |
| **Data Visualization** | Recharts (Admin analytics) |
| **Backend Core** | Node.js (v18+), Express 5, Compression (Gzip/Brotli), CORS |
| **Real-Time & Queue** | Socket.IO v4, `@socket.io/redis-adapter`, IORedis, BullMQ |
| **Computer Vision Microservice** | Python 3.10+, FastAPI, Uvicorn, OpenCV (Headless), Pillow, NumPy |
| **Database & ODM** | MongoDB 6.0+, Mongoose v9 |
| **Cloud & Media Services** | Cloudinary v2, Multer |
| **Security & Auth** | JSON Web Tokens (JWT), BCrypt, Google Auth Library |
| **Payments & Invoicing** | Stripe SDK, Razorpay SDK, PDFKit (Vector invoice engine) |
| **AI Integrations** | Google Gemini API (Multimodal Vision & NLP), Replicate API |

---

## 📁 Repository Structure

```text
CART_NOW/
├── .github/                   # CI/CD Workflows & GitHub issue templates
├── admin/                     # Admin Management Portal (React 19 + Vite)
│   ├── src/
│   │   ├── components/        # Admin UI primitives, charts, sidebar
│   │   ├── pages/             # Dashboard, Orders, Deals, Taxonomy, RMS
│   │   └── App.jsx
│   ├── .env.example           # Safe environment template
│   └── package.json
├── client/                    # Customer Web App (React 19 + Vite)
│   ├── src/
│   │   ├── components/        # Product Cards, Navbars, Modals, Co-Shop
│   │   ├── pages/             # Home, Catalog, ProductDetail, Cart, Checkout
│   │   └── stores/            # Zustand global client state
│   ├── .env.example           # Safe environment template
│   └── package.json
├── deliveryman/               # Logistics Partner Portal (React 19 + Vite)
│   ├── src/
│   │   ├── components/        # Active deliveries, live customer chat
│   │   └── pages/             # Transit dashboard, delivery history
│   ├── .env.example           # Safe environment template
│   └── package.json
├── seller/                    # Vendor Portal (React 19 + Vite)
│   ├── src/
│   │   ├── components/        # Inventory tables, product upload modal
│   │   └── pages/             # Catalog management, orders, financials
│   ├── .env.example           # Safe environment template
│   └── package.json
├── server/                    # Express 5 REST API & WebSocket Server
│   ├── ai-service/            # Python FastAPI microservice (Virtual Try-On)
│   │   ├── main.py            # Computer vision endpoints
│   │   ├── requirements.txt   # Python dependency manifest
│   │   └── Dockerfile
│   ├── config/                # MongoDB, Cloudinary connection logic
│   ├── controllers/           # Route logic (Orders, Auth, AI, Products)
│   ├── middleware/            # Auth, RBAC, Maintenance filters
│   ├── models/                # Mongoose database schemas
│   ├── routers/               # Express modular route definitions
│   ├── scripts/               # Seeders, migration utilities
│   ├── socket/                # Socket.io connection handlers & adapters
│   ├── workers/               # BullMQ async background worker
│   ├── .env.example           # Sanitized server environment template
│   ├── server.js              # Server entrypoint
│   └── package.json
├── vercel.json                # Vercel deployment & security headers config
└── README.md                  # Project documentation
```

---

## ⚙️ Prerequisites & System Requirements

Before running the project, ensure you have the following installed on your machine:

- **Node.js:** `v18.0.0` or higher (Recommended: `v20.x` LTS)
- **NPM:** `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Python:** `v3.10` or higher (Required for AI Try-On service)
- **MongoDB:** Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- **Redis:** `v6.2` or higher (Local or cloud instance like Upstash/Aiven)

---

## 🚀 Quickstart & Installation

### 1. Clone Repository

```bash
git clone https://github.com/sachinsingh999/CartNOWs.git
cd CartNOWs
```

### 2. Environment Configuration (Safe Templates)

Never edit `.env.example` directly with real secrets. Copy each example file to a local `.env` and fill in your development keys:

```bash
# Server configuration
cp server/.env.example server/.env

# Client & Portals configuration
cp client/.env.example client/.env
cp admin/.env.example admin/.env
cp seller/.env.example seller/.env
cp deliveryman/.env.example deliveryman/.env
```

---

### 3. Backend Server Setup

```bash
cd server
npm install

# (Optional) Seed sample products into your MongoDB database
npm run seed:products

# Start server in development mode (with nodemon)
npm run dev
```

The Express API and WebSocket server will run on `http://localhost:4000`.

---

### 4. AI Microservice Setup (Virtual Try-On)

*If you wish to test garment extraction and virtual fitting locally:*

```bash
cd server/ai-service

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install computer vision dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Launch FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The microservice will be available at `http://127.0.0.1:8000`.

---

### 5. Client & Dashboards Setup

Open separate terminal tabs for the frontend applications you wish to run:

#### Customer Storefront (Port 5173)
```bash
cd client
npm install
npm run dev
```

#### Admin Dashboard (Port 5174)
```bash
cd admin
npm install
npm run dev -- --port 5174
```

#### Seller Portal (Port 5175)
```bash
cd seller
npm install
npm run dev -- --port 5175
```

#### Delivery Partner Portal (Port 5176)
```bash
cd deliveryman
npm install
npm run dev -- --port 5176
```

---

## 🔐 Environment Variables Reference

### Backend Server (`server/.env`)

| Variable Name | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `4000` | HTTP port where Express server listens |
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017` | MongoDB connection connection string |
| `JWT_SECRET` | **Yes** | `[High-entropy 64+ char key]` | Secret key used to sign and verify JSON Web Tokens |
| `ADMIN_EMAIL` | **Yes** | `admin@cartnow.com` | Initial superadmin account email |
| `ADMIN_PASSWORD` | **Yes** | `[Secure Strong Password]` | Initial superadmin account password |
| `CLOUDINARY_NAME` | **Yes** | `your_cloud_name` | Cloudinary storage account name |
| `CLOUDINARY_API_KEY` | **Yes** | `your_api_key` | Cloudinary public API key |
| `CLOUDINARY_SECRET_KEY` | **Yes** | `your_secret_key` | Cloudinary private secret key |
| `STRIPE_SECRET_KEY` | No | `sk_test_...` | Stripe secret key for card payment intents |
| `RAZORPAY_KEY_ID` | No | `rzp_test_...` | Razorpay public key ID |
| `RAZORPAY_KEY_SECRET` | No | `your_razorpay_secret` | Razorpay private secret key |
| `GOOGLE_CLIENT_ID` | No | `*.apps.googleusercontent.com` | Google Cloud OAuth client identifier |
| `GEMINI_API_KEY` | No | `AIzaSy...` | Google Gemini API key for assistant & categorization |
| `REDIS_URL` | No | `redis://127.0.0.1:6379` | Redis instance for BullMQ workers and Socket clustering |
| `AI_SERVICE_URL` | No | `http://127.0.0.1:8000` | URL to internal Python FastAPI try-on service |

### Frontend Applications (`client/.env`, `admin/.env`, `seller/.env`, `deliveryman/.env`)

| Variable Name | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_BACKEND_URL` | **Yes** | `http://localhost:4000` | Base URL of the CartNOW backend server |
| `VITE_GOOGLE_CLIENT_ID` | No | `*.apps.googleusercontent.com` | Google Client ID for customer OAuth login (client only) |

---

## 📡 API Endpoints Overview

| Service Scope | Endpoint Group | Supported Methods | Description |
| :--- | :--- | :---: | :--- |
| **Authentication** | `/api/user` | `POST` | User registration, password login, Google OAuth verification, profile updates |
| **Catalog** | `/api/product` | `GET`, `POST`, `PUT`, `DELETE` | Public product catalog, pagination, seller product CRUD, stock updates |
| **Cart & Wishlist** | `/api/cart`, `/api/wishlist` | `GET`, `POST`, `DELETE` | Add/remove items, quantity adjustments, wishlist synchronization |
| **Orders & Checkout**| `/api/order` | `GET`, `POST`, `PUT` | Place order (COD/Stripe/Razorpay), payment verification, order history |
| **Invoices** | `/api/invoice` | `GET` | Stream or download generated PDF invoices |
| **Returns & RMS** | `/api/rms` | `GET`, `POST`, `PUT` | Customer return requests, seller/admin status transitions, refunds |
| **Social Commerce** | `/api/social` | `GET`, `POST`, `DELETE` | Posts, stories, comment threads, likes, and merchant reviews |
| **Virtual Try-On** | `/api/tryon` | `POST`, `GET` | Submit user photo + garment for background BullMQ fitting queue |
| **Live Chat** | `/api/order-communication` | `GET`, `POST` | Order-bound chat histories between buyers and couriers |
| **Seller Portal** | `/api/seller` | `GET`, `POST`, `PUT` | Seller onboarding, earnings dashboard, catalog filters |
| **System & Admin** | `/api/admin`, `/api/system` | `GET`, `POST`, `PUT` | Global maintenance toggle, banners, coupons, platform analytics |

---

## 🗄️ Database Seeders & Utility Scripts

CartNOW includes preconfigured helper scripts inside `server/scripts/` to accelerate local setup:

```bash
# Seed initial product database with mock images and categories
npm --prefix server run seed:products

# Seed taxonomy (categories, subcategories, and tags)
node server/scripts/seedTaxonomy.js

# Create sample seller account
node server/scripts/create-seller.js

# Verify platform maintenance status
node server/scripts/check_maintenance_status.js
```

---

## 🛡️ Security & Hardening Policy

### Zero Credential Exposure Policy
- **Git Hygiene:** All `.env`, `.env.local`, `.env.production`, and upload directories are strictly guarded by `.gitignore`.
- **Placeholder Safety:** All committed `.env.example` templates contain mock values only. Never place production keys into example manifests.
- **Server Startup Validation:** The backend automatically throws a fatal startup error if `JWT_SECRET` is undefined or blank (`server.js`).

### HTTP Security Headers
The server enforces strict HTTP security headers on all responses:
- `Cross-Origin-Opener-Policy`: `same-origin-allow-popups` (enables secure Google OAuth popups).
- `X-Frame-Options`: `SAMEORIGIN` (prevents clickjacking attacks).
- `X-Content-Type-Options`: `nosniff` (mitigates MIME-type confusion attacks).
- `Content-Security-Policy`: `frame-ancestors 'self'` (disallows unauthorized third-party embedding).
- `Strict-Transport-Security`: Enforces 1-year HSTS with subdomains and preload enabled.

### Authentication & RBAC
- Passwords hashed using **BCrypt** with high salt rounds.
- Stateless authentication using **JSON Web Tokens (JWT)** with role verification middleware (`verifyUser`, `verifyAdmin`, `verifySeller`, `verifyDeliveryman`).

### Reporting Security Vulnerabilities
If you identify any security issue or vulnerability within CartNOW, please open a private GitHub Security Advisory or email the repository owner directly rather than posting public GitHub issues.

---

## 🌐 Deployment Guide

### Vercel (Frontends)
The repository includes a root `vercel.json` configured for Single Page Applications (SPAs). It handles client-side route rewrites and assigns appropriate HTTP security and cache headers to compiled assets.

To deploy any portal on Vercel:
1. Set the **Root Directory** to `client/` (or `admin/`, `seller/`, `deliveryman/`).
2. Add the appropriate environment variables (`VITE_BACKEND_URL`, etc.).
3. Build Command: `npm run build` | Output Directory: `dist`.

### Docker & Containerization
For deploying the Express server and Python AI microservice:
- A dedicated `server/ai-service/Dockerfile` is available for containerizing the FastAPI vision microservice.
- Ensure Redis and MongoDB connections are properly mapped via container network bridges or managed cloud URLs.

---

## 🤝 Contributing

Contributions are what make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your Changes:
   ```bash
   git commit -m "feat: Add AmazingFeature"
   ```
4. Push to the Branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a **Pull Request**.

---

## 📄 License

Distributed under the **ISC License**. See the `LICENSE` file or package configurations for more information.

<p align="center">
  Made with ❤️ by <a href="https://github.com/sachinsingh999">Sachin Singh</a>
</p>
