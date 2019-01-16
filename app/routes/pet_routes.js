// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for pets
const User = require('../models/user')
const { Pet } = require('../models/pet')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
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

// UPDATE
// PATCH /pets/5a7db6c74d55bc51bdf39793
// router.patch('/pets/:id', requireToken, (req, res) => {
//   // if the client attempts to change the `owner` property by including a new
//   // owner, prevent that by deleting that key/value pair
//   delete req.body.user.pet.owner

//   User.findByIdAnd(req.params.id)
//     .then(handle404)
//     .then(pet => {
//       // pass the `req` object and the Mongoose record to `requireOwnership`
//       // it will throw an error if the current user isn't the owner
//       requireOwnership(req, pet)
//
//       // the client will often send empty strings for parameters that it does
//       // not want to update. We delete any key/value pair where the value is
//       // an empty string before updating
//       Object.keys(req.body.pet).forEach(key => {
//         if (req.body.pet[key] === '') {
//           delete req.body.pet[key]
//         }
//       })
//
//       // pass the result of Mongoose's `.update` to the next `.then`
//       return pet.update(req.body.pet)
//     })
//     // if that succeeded, return 204 and no JSON
//     .then(() => res.sendStatus(204))
//     // if an error occurs, pass it to the handler
//     .catch(err => handle(err, res))
// })

// Destroy
router.delete('/pets/:id', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      const petI = user.pets.indexOf(req.params.id)
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
    .then(user => {
      // console.log(user)
      const currentPet = user.pets.find(pet => String(pet._id) === req.params.id)
      // const nextPet = { ...currentPet, ...req.body.pet }
      console.log(currentPet)
      currentPet.update(req.body.pet)
      // user.save()
    })
    .then(handle404)
    .then(pet => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, pet)

      // delete any key/value pair where the value is empty before updating
      Object.keys(req.body.pet).forEach(key => {
        if (req.body.pet[key] === '') {
          delete req.body.pet[key]
        }
      })

      // pass the result of Mongoose's `.update` to the next `.then`
      return pet.update(req.body.pet)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
