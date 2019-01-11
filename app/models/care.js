const mongoose = require('mongoose')

const careSchema = new mongoose.Schema({
  Diet: {
    type: String,
    required: true
  },
  Medicine: {
    type: String,
    required: true
  },
  Vet: {
    type: String,
    required: true
  },
  LastAppt: {
    type: Date,
    required: true
  },
  NextAppt: {
    type: Date,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Care', careSchema)
