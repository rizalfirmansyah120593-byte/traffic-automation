# 🚀 Web Traffic Lab: Advanced Browser Automation Platform

Web Traffic Lab is a sophisticated, production-ready browser automation engine designed to simulate high-fidelity human browsing behavior. Whether you need to test site performance under load, verify analytics integration, or simulate complex search engine referral patterns, Web Traffic Lab provides a secure and scalable environment for all your Traffic Automation needs.

---

## 📸 Project Showcase

The platform features a modern, intuitive dashboard that provides real-time visibility into every automation cycle.

| Step | Description | Visual |
| :--- | :--- | :--- |
| **1. Configuration** | Custom URL, traffic mode, and visit parameters. | ![Starting](./images/step1_starting.png) |
| **2. Live Execution** | Real-time SSE updates and loop progress. | ![Progress](./images/step2_progress.png) |
| **3. Result Summary** | Comprehensive analytics and performance logs. | ![Success](./images/step3_success.png) |
| **4. Real-time Impact** | Immediate visibility in GA4 Real-time dashboard. | ![Impact](./images/step4_analytics_low.png) |
| **5. High-Scale Load** | Sustaining hundreds of active concurrent sessions. | ![Scale](./images/step5_analytics_high.png) |

---

## 🌟 Core Functionality

### 🤖 Intelligent Traffic Simulation
- **Human-Like Interaction**: Emulates mouse movements, scrolling patterns, and natural click behavior to bypass basic heuristic detection.
- **Anti-Detection Engineering**: Leverages Playwright Stealth to minimize browser fingerprinting and appear as a genuine user.
- **Referrer Spoofing**: Simulates organic traffic origins from major search engines and social platforms.

### ⚡ Performance & Scalability
- **Storm Mode**: Optimized for high-volume concurrency to test infrastructure limits.
- **Batch Processing**: Intelligent visit queuing to manage system resources effectively.
- **Live Monitoring**: Server-Sent Events (SSE) provide a zero-latency feedback loop between the backend engine and the user interface.

### 🛡️ Enterprise-Grade Security
- **SSRF Protection**: Built-in validation to prevent the automation engine from accessing internal or restricted network resources.
- **Browser Isolation**: Each session runs in a clean, isolated environment to ensure data privacy and prevent cross-session contamination.
- **Rate Safeguards**: Configurable limits to ensure responsible usage and prevent accidental abuse.

---

## 🛠️ Technical Ecosystem

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks & Context API
- **UI Components**: Custom-built responsive dashboard

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server**: [Express](https://expressjs.com/)
- **Automation Engine**: [Playwright](https://playwright.dev/) with Stealth & Ad-blocker plugins
- **Communication**: Server-Sent Events (SSE) for real-time streaming

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18+`
- **npm**: `v10+`

### 2. Installation
Clone the repository and install dependencies for both backend and frontend:
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Environment Setup
Install the necessary Playwright browser binaries:
```bash
npx playwright install chromium
```

### 4. Launch Development
```bash
npm run dev
```
- **Dashboard**: `http://localhost:5176`
- **API Engine**: `http://localhost:3006`

### 5. Hostinger Node.js Deployment

Create a Node.js application in Hostinger and point its application root to this
project directory. Use Node.js 18 or newer, then configure:

```text
Application startup file: backend/server.js
Application mode: Production
Build command: npm install && cd frontend && npm install && npm run build
Start command: npm start
Environment: NODE_ENV=production
```

The root `npm install` and `npm start` automatically download the Chromium
binary. The `prestart` step is intentional and also repairs deployments where
Hostinger restored `node_modules` without running npm lifecycle scripts. Do not
use `node backend/server.js` as the start command. Hostinger supplies the
`PORT` value, so the server must not be configured to a fixed public port.

---

## 🧪 Use Cases
- **SEO & Referral Testing**: Verify that your site correctly attributes traffic from various search engine referrers.
- **Analytics Validation**: Ensure Google Analytics (GA4) and other tracking scripts are firing correctly under different browsing conditions.
- **Performance Benchmarking**: Stress test your web server and CDN performance with simulated concurrent traffic.
- **UI/UX Stability**: Automate repetitive navigation paths to ensure frontend stability across updates.

---

## 🛡️ Responsible Usage
Web Traffic Lab is designed for **testing and development purposes only**. Users are responsible for ensuring their automation activities comply with the Terms of Service of the target websites and all applicable laws.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.
