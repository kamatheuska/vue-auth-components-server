const { AssertionError } = require('assert')

module.exports = {
    handleAssertionError: (error, req, res, next) => {
        if (error instanceof AssertionError) {
            return res.status(400).json({
                type: 'AssertionError',
                message: error.message
            })
        }
        next(error)
    },

    handleDatabaseError: (error, req, res, next) => {
        if (error.name === 'ValidationError') {
            return res.status(400).send(error)
        } else if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(403).send(error)
        }
        next(error)
    },
    
    handleAutheticationError: (error, req, res, next) => {
        if (error.name === 'AuthenticationError') {
            return res.status(401).send(error)
        }
        next(error)
    },
    
    handleJwtError: (error, req, res, next) => {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send(error)
        }
        next(error)
    },
    
    
    handleUndefinedError: (error, req, res, next) => { // eslint-disable-line
    console.log('---->>  ERROR...\n', error)
        res.status(400).send(error)
    }
}
