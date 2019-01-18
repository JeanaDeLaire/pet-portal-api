// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')


const ObjectId = require('mongoose').Types.ObjectId

// pull in Mongoose model for examples
const User = require('../models/user')
const { Picture } = require('../models/picture')

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
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

const multer = require('multer')
const picture = multer({ dest: 'pictures/' })
const s3Upload = require('../../lib/aws-s3-upload')

const fs = require('fs')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /examples
router.get('/pictures', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      // `examples` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return user.pictures.map(picture => picture.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(pictures => res.status(200).json({ pictures: pictures }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/pictures/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  Picture.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(picture => res.status(200).json({ picture: picture.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// once s3 is done, delete it
// CREATE
// POST /examples
router.post('/pictures', [requireToken, picture.single('image')], (req, res) => {
  console.log(req)
  // look into req file to confirm information matches schema
  const deleteFromApi = () => {
    fs.unlink(req.file.path, function (err) {
      if (err) throw err
      console.log('File Deleted')
    })
  }

  s3Upload(req.file.path, req.file.originalname, req.file.description) // make sure
  // s3Upload function expects the right number of arguments
    .then((response) => {
      console.log(response.Location)
      console.log(req.user.id)
      // set owner of new upload to be current user
      // req.body.bucket.owner = req.user.id
      return Picture.create({
        description: req.body.description,
        url: response.Location,
        owner: req.user.id
      })
    })
    .then((picture) => User.findByIdAndUpdate(req.user.id, {$push: {pictures: picture}}, {new: true}))
  // respond wtih json
    .then(user => {
      // add step to delete file (create function elsewhere using fs.DELETE
      // file path will be buckets/filename)
      res.status(201).json({ user: user.toObject() })
      deleteFromApi()
      // res.status(201).json({ picture: picture.toObject() })
      // deleteFromApi()
    })
    .catch((err) => {
    // add step to delete file (create function elsewhere using fs.DELETE
    // file path will be buckets/filename)
      console.error(err)
      deleteFromApi()
    })
  // respond to succesful `create` with status 201 and JSON of new “upload”
  // .then(upload => {
  //   res.status(201).json({ upload: upload.toObject() })
  // })
  // if an error occurs, pass it off to our error handler
  // the error handler needs the error message and the `res` object so that it
  // can send an error message back to the client
  // .catch(err => handle(err, res))
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/pictures/:id', requireToken, (req, res) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.picture.owner
  console.log('hello, I am your patch route')
  Picture.findById(req.params.id)
    .then(handle404)
    .then(picture => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, picture)

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      Object.keys(req.body.picture).forEach(key => {
        if (req.body.picture[key] === '') {
          delete req.body.picture[key]
        }
      })
      // pass the result of Mongoose's `.update` to the next `.then`
      return picture.update(req.body.picture)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// Destroy
router.delete('/pictures/:id', requireToken, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      const pictureI = user.pictures.indexOf(req.params.id)
      console.log('start ', user.pictures, '\n\n')
      user.pictures.splice(pictureI - 1, 1)
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// // DESTROY
// // DELETE /examples/5a7db6c74d55bc51bdf39793
// router.delete('/pictures/:id', requireToken, (req, res) => {
//   Picture.findById(req.params.id)
//     .then(handle404)
//     .then(picture => {
//       // throw an error if current user doesn't own `example`
//       requireOwnership(req, picture)
//       // delete the example ONLY IF the above didn't throw
//       picture.remove()
//     })
//     // send back 204 and no content if the deletion succeeded
//     .then(() => res.sendStatus(204))
//     // if an error occurs, pass it to the handler
//     .catch(err => handle(err, res))
// })

module.exports = router
