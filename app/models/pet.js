const mongoose = require('mongoose')
const Schema = mongoose.Schema

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
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
  care: [{ type: Schema.Types.ObjectId, ref: 'Care' }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Pet', petSchema)
