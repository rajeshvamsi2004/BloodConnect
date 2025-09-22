const express = require('express')
const path = require('path');
const { spawn } = require('child_process');
const nodemailer = require('nodemailer');
const app = express();
const reg = require('./models/Rmodel');
const donor = require('./models/Donor');
const Request = require('./models/Request');
const Bloodbank = require('./models/Bloodbank');

// Assuming bloodcamps model exists as it's used below
// const bloodcamps = require('./models/Camp'); 
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'r87921749@gmail.com', // Replace with your App Password user if needed
    pass: 'ktez qhrv heyl bklb'  // Use your Gmail App Password
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const API_URL = process.env.API_URL || 'http://192.168.1.34:4000'; // Important for email links

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Default route
app.get('/', (req, res) => {
  res.send("BloodConnect API is running.");
});

// Register route
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
const otpStore = {};
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

// --- UPDATED BLOOD REQUEST CREATION WITH HTML EMAIL ---
app.post('/blood-request', async (req, res) => {
  try {
    const { Name, Age, Blood, Email, PhoneNumber } = req.body;
    const newRequest = new Request({ Name, Age, Blood, Email, PhoneNumber, Status: 'pending' });
    await newRequest.save();

    const matchingDonors = await donor.find({ Blood, Email: { $ne: Email } });

    for (const donorUser of matchingDonors) {
      const acceptUrl = `${API_URL}/update-request-status/${newRequest._id}?status=accepted`;
      const rejectUrl = `${API_URL}/update-request-status/${newRequest._id}?status=rejected`;

      const mailOptions = {
        from: 'r87921749@gmail.com',
        to: donorUser.Email,
        subject: `🩸 Urgent Blood Request for Blood Group ${Blood}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <h2 style="color: #d9534f; text-align: center;">Urgent Blood Donation Request</h2>
            <p>Hello ${donorUser.Name},</p>
            <p>A patient is in urgent need of your blood group (<strong>${Blood}</strong>). You can respond directly in the app, or use the buttons below.</p>
            <h3 style="color: #555;">Patient Details:</h3>
            <ul><li><strong>Name:</strong> ${Name}</li><li><strong>Age:</strong> ${Age}</li></ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" style="background-color: #5cb85c; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Yes, I Can Donate</a>
              <a href="${rejectUrl}" style="background-color: #d9534f; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Sorry, I Cannot</a>
            </div>
            <p style="text-align: center; font-size: 0.9em; color: #888;">Thank you for being a hero!<br><strong>~ BloodConnect</strong></p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }
    res.status(201).send({ message: matchingDonors.length > 0 ? 'Request created and emails sent.' : 'Request created, but no matching donors found.' });
  } catch (error) {
    res.status(500).send('Request unable to create');
  }
});

// --- NEW ENDPOINT TO HANDLE EMAIL LINK CLICKS ---
app.get('/update-request-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).send('<h1>Invalid Action</h1>');
    }
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).send('<h1>Request Not Found</h1>');
    }
    if (request.Status !== 'pending') {
      return res.status(200).send(`<h1>Response Already Recorded</h1><p>This request is no longer pending. Thank you.</p>`);
    }
    request.Status = status;
    await request.save();
    const messageTitle = status === 'accepted' ? 'Thank You for Accepting!' : 'Response Recorded';
    const messageBody = status === 'accepted' ? `The requester has been notified. You are a lifesaver!` : `We understand you cannot donate at this time. Thank you for responding.`;
    res.status(200).send(`<div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;"><h1 style="color: #4CAF50;">${messageTitle}</h1><p>${messageBody}</p></div>`);
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// Update request status (used by the in-app frontend buttons)
app.put('/blood-request/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).send({ message: 'Invalid status.' });
    }
    const updated = await Request.findByIdAndUpdate(req.params.id, { Status: status }, { new: true });
    if (!updated) return res.status(404).send({ message: "The Request was not found." });
    res.status(200).send({ message: `Request has been ${status}` });
  } catch (error) {
    res.status(500).send({ message: "Server error while updating request." });
  }
});

// --- NEW ENDPOINT TO POWER THE "INCOMING REQUESTS" PAGE ---
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

// Start the server
app.listen(PORT, () => {
  console.log(`The Port ${PORT} is Running Successfully`);
});