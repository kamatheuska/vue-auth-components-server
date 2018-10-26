require('./config')

const path = require('path')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const _ = require('lodash')
const { db } = require('./db/mongoose')
const app = express()

const dist = path.join(__dirname, 'dist')
const userLimit = process.env.USER_LIMIT

const { User } = require('./models/User')
const { authenticate } = require('./middleware/authenticate')
const { wrapAsync } = require('./utils')
const {
    handleUndefinedError,
    handleAssertionError,
    handleJwtError,
    handleAutheticationError,
    handleDatabaseError } = require('./errors')

app.use(express.static(dist))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// POST /users
app.post('/users',

    (req, res, next) => {
        User.countDocuments()
            .then((count) => {
                if (count >= userLimit) {
                    return res.status(403).json({
                        message: 'Database is full. Sorry!'
                    })
                } else {
                    next()
                }
            })
    },
    (req, res, next) => {
        let body = _.pick(req.body, ['email', 'password'])
        let user = new User(body)
        user.save()
            .then(() => user.generateAuthToken())
            .then((token) => {
                res.header('x-auth', token).send(user)
            })
            .catch(next)
})

app.get('/users/me',
    wrapAsync(authenticate),
    (req, res) => {
        res.send(req.user)
    })
// app.post('/users/all', )
// POST /login {email, password}
app.post('/users/login', (req, res, next) => {
    let body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return user.generateAuthToken().then((token) => {
                res.header('x-auth', token).send(user)
            })
        })
        .catch(next)
})

// DELETE /me/token LOGOUT
app.delete('/users/me/token',
    wrapAsync(authenticate),
    (req, res, next) => {
        req.user.removeToken(req.token)
            .then((data) => {
                res.status(200).json(data)
            })
            .catch(next)
    })

app.get('*',
    wrapAsync(authenticate),
    (req, res) => {
        if (res.user.authenticated) {
            res.sendFile(dist + '/index.html')
        }
    })

app.use(handleAssertionError)
app.use(handleDatabaseError)
app.use(handleAutheticationError)
app.use(handleJwtError)
app.use(handleUndefinedError)

module.exports = { app }
