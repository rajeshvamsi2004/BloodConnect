const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  Name: String,
  State: String,
  City: String,
  Contact: String,
  Blood: [String]
},{collection: 'bloodbank'})
module.exports = mongoose.model("Bloodbank",schema)