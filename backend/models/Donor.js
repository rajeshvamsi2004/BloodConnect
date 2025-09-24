// models/Donor.js

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Age: {
    type: Number,
    required: true
  },
  Blood: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  PhoneNumber: {
    type: String,
    required: true
  }
}, { collection: 'Donor' });

module.exports = mongoose.model("donor", schema);
