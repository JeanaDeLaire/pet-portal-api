// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for pets
const User = require('../models/user')
const { Pet } = require('../models/pet')

const handle = require('../../lib/error_handler')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /pets
router.get('/pets', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      // `pets` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return user.pets.map(pet => pet.toObject())
    })
    // respond with status 200 and JSON of the pets
    .then(pets => res.status(200).json({ pets: pets }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// CREATE
// POST /pets
router.post('/pets', requireToken, (req, res) => {
  // set owner of new pet to be current user

  const pet = new Pet(req.body.pet)

  User.findByIdAndUpdate(req.user.id, {$push: {pets: pet}}, {new: true})
    // respond to succesful `create` with status 201 and JSON of new "pet"
    .then(user => {
      console.log(user.toObject())
      res.status(201).json({ pets: user.toObject().pets })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

// Destroy
router.delete('/pets/:id', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      const petI = user.pets.findIndex(pet => String(pet._id) === req.params.id)
      console.log('start ', user.pets, '\n\n')
      user.pets.splice(petI - 1, 1)
      console.log('after ', user.pets)
      user.save()
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// UPDATE
router.patch('/pets/:id', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(handle404)
    .then(user => {
      const currentPet = user.pets.find(pet => String(pet._id) === req.params.id)
      currentPet.set(req.body.pet)
      return user.save()
    })
    .then((user) => {
      const pet = user.pets.find(pet => String(pet._id) === req.params.id)
      console.log(pet)
      res.status(200).json({ pet })
    })
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
