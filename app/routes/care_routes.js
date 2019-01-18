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
  const petId = req.body.care.pet
  delete req.body.care.pet

  // make a new care doc
  const care = new Care(req.body.care)

  // update the user object using filtering and a nested $push
  User.update({ '_id': req.user.id, 'pets._id': petId },
    { $push: { 'pets.$.cares': care } }, { new: true }
  )
    // .then(user => {
    //   console.log(user.toObject())
    //   res.status(201).json({ user: user.toObject() })
    // })
    .then(() => {
      res.sendStatus(201)
    })
    .catch(err => handle(err, res))
})

// Destroy
router.delete('/cares/:id', requireToken, (req, res) => {
  console.log(req.params.id)
  const petId = req.user.pets.findIndex(pet => pet.cares._id === req.params.id)
  console.log(petId)
  User.update({ '_id': req.user.id, 'pets._id': petId }, { $pull: { cares: { _id: new ObjectId(req.params.id) } } })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
