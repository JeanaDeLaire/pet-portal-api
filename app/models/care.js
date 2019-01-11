const mongoose = require('mongoose')

const careSchema = new mongoose.Schema({
  diet: {
    type: String,
    required: true
  },
  medicine: {
    type: String,
    required: true
  },
  vet: {
    type: String,
    required: true
  },
  lastAppt: {
    type: Date,
    required: false
  },
  nextAppt: {
    type: Date,
    required: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Care', careSchema)
