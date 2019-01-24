// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for pets
const User = require('../models/user')
const { Care } = require('../models/care')

const handle = require('../../lib/error_handler')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

const ObjectId = require('mongoose').Types.ObjectId

// INDEX
// GET /pets
router.get('/cares', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      const petI = user.pets.indexOf(req.body.pet._id)
      return user.pet[petI].cares.map(care => care.toObject())
    })
    // respond with status 200 and JSON of the cares
    .then(cares => res.status(200).json({ cares: cares }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// Create
router.post('/cares', requireToken, (req, res) => {
  // save the pet id and remove it from the body
  // const petId = req.body.care.pet
  // delete req.body.care.pet

  // make a new care doc
  const care = new Care(req.body.care)
  // update the user object using filtering and a nested $push
  User.findOneAndUpdate({
    '_id': req.user.id,
    'pets._id': req.body.care.pet
  },
  {
    $push: { 'pets.$.cares': care }
  }, { new: true }
  )
    // .then(user => {
    //   console.log(user.toObject())
    //   res.status(201).json({ user: user.toObject() })
    // })
    .then(user => {
      res.status(201).json({ user: user.toObject() })
    })
    .catch(err => handle(err, res))
})

// Destroy
router.delete('/cares/:id', requireToken, (req, res) => {
  const { id: careId } = req.params

  User.findById(req.user.id)
    .then(user => {
      const { pets } = user

      const pet = pets.find(pet => {
        const careIds = pet.cares.map(care => care._id.toString())
        return careIds.includes(careId)
      })

      pet.cares.pull({ _id: careId })

      return user.save()
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
