# ResQdrive - Frontend Setup & Run Guide

This is the frontend client application for the ResQdrive project, built using **React**, **Vite**, and **Tailwind CSS**.

---

## 🛠️ Prerequisites

Before starting, make sure you have the following installed:
* **Node.js** (v18 or higher recommended)
* **npm** (comes packaged with Node.js)

---

## 🚀 Setup and Running the Project

Follow these steps to get the frontend server running:

### 1. Install Dependencies
Run the following command in the frontend root directory (`ResQdrive/`) to install all required packages:
```bash
npm install
```

### 2. Run the Development Server
To start the React development server locally, run:
```bash
npm run dev
```

The application will start running and will be accessible at: **`http://localhost:5173`** (or `5174`, `5175`, depending on availability).

---

## 📂 Project Structure

```text
ResQdrive/
 ├── public/        # Static assets (images, icons)
 ├── src/
 │    ├── components/ # Reusable UI components
 │    ├── pages/      # Route pages (Home, Login, Register, Profile, etc.)
 │    ├── App.jsx     # Main App component & Routes config
 │    ├── main.jsx    # React entry point
 │    └── index.css   # Tailwind / Global styling
 ├── tailwind.config.js # Tailwind CSS configuration
 └── vite.config.js # Vite configuration
```

---

## 🔌 API Integration

The frontend connects to the backend API running at `http://localhost:8080`.
* Make sure your backend server is running before attempting to log in, register, or fetch data.
* If you face CORS issues, verify the `WebConfig.java` configuration in the backend.
