const mongoose = require('mongoose')

const careSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Care', careSchema)
