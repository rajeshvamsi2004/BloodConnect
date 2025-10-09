const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Age: { type: Number, required: true },
  Blood: { type: String, required: true },
  Email: { type: String, required: true }, // Requester's email
  PhoneNumber: { type: String, required: true },
  Status: {
    type: String,
    enum: ['pending', 'rejected', 'accepted'],
    default: 'pending',
  },
  // --- CORRECTED FIELD ---
  // Use camelCase 'acceptedBy' and ensure the ref 'donor' matches your donor model name.
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "donor", // This MUST match the name you used in mongoose.model('donor', ...)
    default: null
  }
}, { timestamps: true }); // Using timestamps is highly recommended

module.exports = mongoose.model('Request', requestSchema);
