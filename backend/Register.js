const express = require('express');
const { spawn } = require('child_process');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const corsOptions = {
  origin: 'https://bloodconnect-1-6a1t.onrender.com', // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // allow cookies if needed
};
const reg = require('./models/Rmodel');
const donor = require('./models/Donor');
const Request = require('./models/Request');

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'r87921749@gmail.com',
    pass: process.env.EMAIL_PASS || 'whbb pwys ukvm zuid'
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const API_URL = process.env.API_URL || 'https://bloodconnect-1-6a1t.onrender.com';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const otpStore = {};

// --- USER & DONOR AUTH/REGISTRATION ROUTES (Unchanged) ---
app.post('/register', async (req, res) => {
  const { Username, Email, Password } = req.body;
  try {
    const ex = await reg.findOne({ Email });
    if (ex) return res.status(409).send("User Existed");

    const newuser = new reg({ Username, Email, Password });
    await newuser.save();
    res.status(201).send("Registered Successfully");
  } catch (error) {
    res.status(500).send("Registration Unsuccessful");
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const old = await reg.findOne({ Email });
    if (!old) return res.status(404).send("User Not Found");
    if (old.Password !== Password) return res.status(401).send("Invalid Credentials");
    res.status(200).send("Login Successful");
  } catch (error) {
    res.status(500).send("Login Error");
  }
});

// Donor registration
app.post('/donor', async (req, res) => {
  const { Name, Age, Blood, Email, PhoneNumber } = req.body;
  try {
    const existed = await donor.findOne({ Email });
    if (existed) return res.status(409).send("User Already Existed as a Donor");

    const newdonor = new donor({ Name, Age, Blood, Email, PhoneNumber });
    await newdonor.save();
    res.status(201).send("Successfully registered as a donor");
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// OTP generation and verification

app.post('/send-email', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const mailOptions = {
    from: 'r87921749@gmail.com',
    to: email,
    subject: 'Your BloodConnect OTP Code',
    text: `Your OTP is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).send('Failed to send email');
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email].toString() === otp.toString()) {
    delete otpStore[email];
    return res.status(200).send({ message: 'OTP verified successfully' });
  }
  return res.status(400).send({ message: 'Invalid or expired OTP' });
});



// --- BLOOD REQUEST CREATION (CORRECTED) ---
app.post('/blood-request', async (req, res) => {
  try {
    const { Name, Age, Blood, Email, PhoneNumber } = req.body;
    const newRequest = new Request({ Name, Age, Blood, Email, PhoneNumber, Status: 'pending' });
    await newRequest.save();

    const matchingDonors = await donor.find({ Blood, Email: { $ne: Email } });

    for (const donorUser of matchingDonors) {
      // CHANGED: Send the donor's unique ID for a reliable update
      const acceptUrl = `${API_URL}/update-request-status/${newRequest._id}?status=accepted&donorId=${donorUser._id}`;
      const rejectUrl = `${API_URL}/update-request-status/${newRequest._id}?status=rejected`;

      const mailOptions = {
        from: 'r87921749@gmail.com',
        to: donorUser.Email,
        subject: `🩸 Urgent Blood Request for Blood Group ${Blood}`,
        html: `... your email HTML ...`
      };
      await transporter.sendMail(mailOptions);
    }
    res.status(201).send({ message: 'Request created and notifications sent.' });
  } catch (error) {
    res.status(500).send('Request unable to create');
  }
});

// --- HANDLE EMAIL LINK CLICKS (CORRECTED) ---
app.get('/update-request-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, donorId } = req.query; // CHANGED: Expecting donorId

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).send('<h1>Invalid Action</h1>');
    }

    const request = await Request.findById(id);
    if (!request) return res.status(404).send('<h1>Request Not Found</h1>');
    if (request.Status !== 'pending') return res.status(200).send(`<h1>Response Already Recorded</h1>`);

    if (status === 'accepted' && donorId) {
      // CHANGED: Use the consistent 'acceptedBy' field
      request.status = 'accepted';
      request.acceptedBy = donorId;
      await request.save();
    }
    
    // For rejection, we don't need to change the request, just show a message.

    const messageTitle = status === 'accepted' ? 'Thank You for Accepting!' : 'Response Recorded';
    const messageBody = status === 'accepted' ? 'The requester has been notified. You are a lifesaver!' : 'Thank you for responding.';
    res.status(200).send(`<div style="..."><h1...>${messageTitle}</h1><p>${messageBody}</p></div>`);
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// --- IN-APP UPDATE REQUEST STATUS (CORRECTED for DONORS) ---
app.put('/blood-request/:id', async (req, res) => {
  try {
    const { status, donorId } = req.body;

    // --- Step 1: Validate the incoming status ---
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).send({ message: 'Invalid status provided.' });
    }

    // --- Step 2: Handle an 'accepted' status ---
    if (status === 'accepted') {
      // An 'accepted' status MUST be accompanied by a donorId.
      if (!donorId) {
        return res.status(400).send({ message: 'A donor ID is required to accept a request.' });
      }

      const updatedRequest = await Request.findOneAndUpdate(
        { _id: req.params.id, Status: 'pending' }, // IMPORTANT: Only update if it's still pending
        { Status: 'accepted', acceptedBy: donorId }, // Set status and the donor who accepted
        { new: true }
      );
      
      if (!updatedRequest) {
        return res.status(404).send({ message: "Request not found or was already handled by another donor." });
      }
      return res.status(200).send({ message: `Request has been accepted.` });
    }

    // --- Step 3: Handle a 'rejected' status ---
    if (status === 'rejected') {
      const updatedRequest = await Request.findOneAndUpdate(
        { _id: req.params.id, Status: 'pending' }, // IMPORTANT: Only update if it's still pending
        { Status: 'rejected' }, // Simply change the status to 'rejected'
        { new: true }
      );

      if (!updatedRequest) {
        return res.status(404).send({ message: "Request not found or was already handled." });
      }
      return res.status(200).send({ message: `Request has been rejected.` });
    }

  } catch (error) {
    console.error("Error in PUT /blood-request/:id:", error);
    res.status(500).send({ message: "Server error while updating the request." });
  }
});
// --- GET ACCEPTED DONOR DETAILS (CORRECTED for REQUESTER) ---
app.get('/accepted/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query; // requester email

    if (!email) return res.status(400).send({ message: "Requester email is required." });

    // CHANGED: Populate the corrected 'acceptedBy' field
    const request = await Request.findById(id).populate('acceptedBy');
    
    if (!request) return res.status(404).send({ message: "Blood request not found." });
    if (request.Email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).send({ message: "Access denied." });
    }

    if (request.Status === 'accepted' && request.acceptedBy) {
      return res.status(200).send({
        status: "accepted",
        // Return the single donor who accepted
        donors: [request.acceptedBy]
      });
    } else {
      return res.status(200).send({ status: "pending", donors: [] });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal server error." });
  }
});


// --- OTHER ROUTES (Unchanged) ---
app.get('/pending-requests-for-donor', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).send({ message: 'Donor email is required.' });
        }
        const currentDonor = await donor.findOne({ Email: email });
        if (!currentDonor) {
            return res.status(200).json([]); // Not a donor, so no requests for them
        }
        const pendingRequests = await Request.find({
            Status: "pending",
            Blood: currentDonor.Blood,
            Email: { $ne: email }
        });
        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Get accepted donors for a specific request
app.get('/accepted/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    if (!email) return res.status(400).send({ message: "Requester email is required." });
    
    const request = await Request.findById(id);
    if (!request) return res.status(404).send({ message: "Blood request not found." });
    if (request.Email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).send({ message: "Access denied." });
    }

    if (request.Status === 'accepted') {
      const matchingDonors = await donor.find({ Blood: request.Blood });
      return res.status(200).send({ message: "Request accepted.", status: "accepted", donors: matchingDonors });
    } else {
      return res.status(200).send({ message: "Your request is still pending.", status: "pending", donors: [] });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal server error." });
  }
});

// Get all donors
app.get('/donors', async (req, res) => {
    try {
        const allDonors = await donor.find({}, 'Name Age Blood Email PhoneNumber');
        res.status(200).json(allDonors);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Get a user's own requests
app.get('/my-requests', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).send('Email query parameter is required.');
        const userRequests = await Request.find({ Email: email });
        res.status(200).json(userRequests);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Get a user's profile
app.get('/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        let userProfile = await donor.findOne({ Email: email });
        if (!userProfile) {
             userProfile = await reg.findOne({ Email: email }, 'Username Email');
             if(!userProfile) return res.status(404).send('User not found.');
        }
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Update a user's profile
app.put('/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const updatedProfile = await donor.findOneAndUpdate({ Email: email }, req.body, { new: true });
        if (!updatedProfile) return res.status(404).send('Donor profile not found to update.');
        res.status(200).json({ message: 'Profile updated successfully!', profile: updatedProfile });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

function runPythonScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath, ...args]);
        
        let scriptOutput = "";
        let scriptError = "";

        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            scriptError += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Error in ${scriptPath}: ${scriptError}`);
                // Resolve with an empty array on failure so one failing script doesn't kill all results
                resolve([]); 
            } else {
                try {
                    resolve(JSON.parse(scriptOutput));
                } catch (e) {
                    console.error(`Failed to parse JSON from ${scriptPath}:`, e);
                    resolve([]); // Resolve with empty on parsing failure
                }
            }
        });
    });
}

app.get('/api/blood-banks', async (req, res) => {
    // We now need both location name and coordinates
    const { lat, lon, locationName } = req.query;

    if (!lat || !lon || !locationName) {
        return res.status(400).json({ error: "Latitude, longitude, and location name are required." });
    }
    
    console.log(`Received request for ${locationName} at lat=${lat}, lon=${lon}`);

    try {
        // Run both scripts in parallel and wait for them to complete
        const [osmResults, justdialResults] = await Promise.all([
            runPythonScript('scrape_blood_banks.py', [lat, lon]),
            runPythonScript('scrape_justdial.py', [locationName])
        ]);

        // Combine the results from both sources
        const combinedResults = [...osmResults, ...justdialResults];
        
        // --- De-duplicate the results ---
        // Create a Set of unique names to track duplicates
        const uniqueNames = new Set();
        const finalResults = combinedResults.filter(bank => {
            const isDuplicate = uniqueNames.has(bank.name.toLowerCase());
            uniqueNames.add(bank.name.toLowerCase());
            return !isDuplicate;
        });

        console.log(`Found ${osmResults.length} results from OSM and ${justdialResults.length} from Justdial. Returning ${finalResults.length} unique results.`);
        
        res.status(200).json(finalResults);

    } catch (error) {
        console.error("An error occurred while running scraping scripts:", error);
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

app.get('/', (req, res) => {
  res.send('🚀 BloodConnect API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`The Port ${PORT} is Running Successfully`);
});
