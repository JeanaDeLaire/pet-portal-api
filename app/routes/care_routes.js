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

// CREATE
// POST /pets
router.post('/cares', requireToken, (req, res) => {
  const petId = req.body.care.pet
  delete req.body.care.pet
  const care = new Care(req.body.care)
  // set owner of new pet to be current user
  User.findByIdAndUpdate({ '_id': req.user.id, 'pets._id': petId },
    { $push: { 'pets.$[].cares': care } }
  )
  // User.findById(req.user.id)
  // const petI = user.pets.indexOf(req.body.pet._id)
  // User.findByIdAndUpdate(req.user.id, {$push: {pet[petI].cares: care}}, {new: true})
    // respond to succesful `create` with status 201 and JSON of new "pet"
    // .then(user => {
    //   // const petI = user.pets.indexOf(pet => String(pet._id) === req.body.care.pet)
    //   console.log(petId)
    //   console.log(user.pets.id(petId))
    //   // console.log(pet)
    //   // pet.set({$push: {cares: care}})
    //   // console.log(pet)
    //   user.pets.id(petId).cares.set({$push: {cares: care}})
    //   return user.save()
    //   // res.status(201).json({ cares: user.toObject().pets[petI].cares })
    // })
    .then(user => res.status(201))
    // .json({ cares: user.toObject().pet.cares }))
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

// Destroy
router.delete('/cares/:id', requireToken, (req, res) => {
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
