const { User } = require('../models/User')

module.exports = {
    authenticate: (req, res, next) =>
        new Promise((resolve, reject) => {
            let token = req.header('x-auth')
            console.log('...........TESTING ROUTE\n')
            User.findByToken(token)
                .then((user) => {
                    if (!user) {
                        let error = new Error('Token doesn\'t match any users in the database.')
                        error.name = 'AuthenticationError'
                        reject(error)
                        return
                    }

                    req.user = user
                    req.token = token
                    req.user.authenticated = true
                    resolve({ user, token })
                })
                .catch(next)
        })
}
