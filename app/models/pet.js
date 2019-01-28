const mongoose = require('mongoose')
const { careSchema } = require('./care.js')

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cares: [careSchema]
}, {
  timestamps: true
})

const Pet = mongoose.model('Pet', petSchema)
module.exports = { Pet, petSchema }
