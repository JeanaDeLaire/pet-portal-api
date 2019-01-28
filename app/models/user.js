const mongoose = require('mongoose')
const { petSchema } = require('./pet.js')
const { pictureSchema } = require('./picture.js')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
    // unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  token: String,
  pets: [petSchema],
  pictures: [pictureSchema]
}, {
  timestamps: true,
  toObject: {
    // remove `hashedPassword` field when we call `.toObject`
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  }
})

module.exports = mongoose.model('User', userSchema)
