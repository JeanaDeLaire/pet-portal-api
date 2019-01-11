const mongoose = require('mongoose')

const pictureSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
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

module.exports = mongoose.model('Picture', pictureSchema)
