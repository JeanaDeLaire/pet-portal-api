const mongoose = require('mongoose')

const careSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const Care = mongoose.model('Care', careSchema)
module.exports = { Care, careSchema }
