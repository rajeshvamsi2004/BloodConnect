🩸 BloodConnect

Bridging the gap between hope and help. A modern, real-time blood donation
platform.

React Node.js MongoDB Tailwind CSS Vercel

📖 About The Project

Every two seconds, someone needs blood. BloodConnect is a full-stack web
application designed to eliminate the friction in finding blood donors during
emergencies.

Instead of relying on scattered social media posts, BloodConnect provides a
centralized platform where patients can broadcast their exact requirements
(Blood Group, Location, Urgency), and willing donors can instantly accept
requests to save a life.

✨ Why is it Unique?

  - Instantaneous: See exactly when a request was posted with human-readable
    timestamps (e.g., "Requested 5 minutes ago").
  - Targeted: Donors only see requests that match their blood type or
    geographical area.
  - Status Tracking: Real-time status updates (Pending, Accepted, Rejected)
    prevent multiple donors from showing up for a single fulfilled request.

🚀 Core Features

  - 🔒 Secure Authentication: JWT-based login and registration for Donors and
    Receivers.
  - 📝 Dynamic Request Engine: Users can seamlessly create blood requests with
    automated tagging and data validation.
  - ⏱️ Relative Timestamps: Integrated date-fns to show accurate, real-time age
    of requests.
  - 🤝 Donor Matching: Donors can view active requests and accept them with a
    single click.
  - 📱 Fully Responsive UI: Beautiful, mobile-first design crafted with Tailwind
    CSS and interactive toasts (react-toastify).

💻 Tech Stack

Client-Side (Frontend):

  - React.js (Hooks & Context API)
  - Tailwind CSS (Styling)
  - Axios (HTTP Client)
  - Date-Fns (Time formatting)

Server-Side (Backend):

  - Node.js & Express.js
  - MongoDB & Mongoose (ODM)
  - JWT (Authentication)


🛠️ Getting Started

Follow these steps to set up the project locally on your machine.

Prerequisites

  - Node.js installed
  - A MongoDB URI (Local or Atlas)

1. Clone the Repository

git clone https://github.com/your-username/blood-connect.git
cd blood-connect

2. Setup the Backend

cd server
npm install

Create a .env file in the server directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

Start the server:

npm run dev

3. Setup the Frontend

cd ../client
npm install

Create a .env file in the client directory:

REACT_APP_API_BASE_URL=http://localhost:5000

Start the frontend:

npm start

📂 Project Structure

blood-connect/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (BloodRequestForm, etc.)
│   │   ├── context/        # AuthContext for state management
│   │   └── App.js          # Main entry point
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Schemas (Request, Donor)
│   ├── routes/             # API Endpoints
│   └── index.js            # Server entry point
└── README.md
