const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  Username: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  }
},{collection: 'login'})
module.exports = mongoose.model("reg",schema)