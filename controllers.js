const express = require('express')
const router = express.Router()
const _ = require('lodash')

const { User } = require('../models/User')
const { authenticate } = require('../middleware/authenticate')
const { wrapAsync } = require('../utils')

// POST /users
router.post('/', (req, res, next) => {
    let body = _.pick(req.body, ['email', 'password'])
    let user = new User(body)
    user.save()
        .then(() => user.generateAuthToken())
        .then((token) => {
            res.header('x-auth', token).send(user)
        })
        .catch(next)
})

router.get('/me',
    wrapAsync(authenticate),
    (req, res) => {
        res.send(req.user)
    })

// POST /login {email, password}
router.post('/login', (req, res, next) => {
    let body = _.pick(req.body, ['email', 'password'])
    console.log('body\n', body)
    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return user.generateAuthToken().then((token) => {
                res.header('x-auth', token).send(user)
            })
        })
        .catch(next)
})

// DELETE /me/token LOGOUT
router.delete('/me/token',
    wrapAsync(authenticate),
    (req, res, next) => {
        req.user.removeToken(req.token)
            .then((data) => {
                res.status(200).json(data)
            })
            .catch(next)
    })

module.exports = router
