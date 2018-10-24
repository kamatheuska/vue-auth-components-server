const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const { encryptPassword } = require('../utils')
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
})

UserSchema.methods.toJSON = function () {
    let user = this
    let userObject = user.toObject()

    return _.pick(userObject, ['_id', 'email'])
}


UserSchema.methods.generateAuthToken = function () {
    let user = this
    let access = 'auth'
    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET).toString()

    user.tokens = user.tokens.concat([{ access, token }])
    return user.save()
        .then(() => token)
}

UserSchema.methods.removeToken = function (token) {
    let user = this
    return user.updateOne({
        $pull: {
            tokens: { token }
        }
    })
}

UserSchema.statics.findByToken = function (token) {
    let User = this
    let decoded

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return Promise.reject(error)
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this
    return User.findOne({ email }).then((user) => {
        if (!user) {
            let error = new Error('User does not exist')
            error.name = 'AuthenticationError'
            return Promise.reject(error)
        }
        return bcrypt.compare(password, user.password)
            .then((res) => {
                if (res === true) {
                    return user
                } else {
                    let error = new Error('Hash does not match given password')
                    error.name = 'AuthenticationError'
                    return Promise.reject(error)
                }
            })
    })
}

UserSchema.pre('save', function (next) {
    let user = this
    if (user.isModified('password')) {
        encryptPassword(user.password)
            .then((hash) => {
                user.password = hash
                next()
            })
            .catch(next)
    } else {
        next()
    }
})

let User = mongoose.model('User', UserSchema)

module.exports = { User }

