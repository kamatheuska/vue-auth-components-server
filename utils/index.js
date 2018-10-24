const bcrypt = require('bcryptjs')

module.exports = {
    getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),

    /*
     * GET-UNIQUE-ELEMENTS: Use this baby to reduce an array with a lot of
     *                      repeated elements, and eliminate the copycats.
     *                      It takes an array as an argument (No objects, dont
     *                      get smart now), and returns a String.
     *
     */

    getUniqueElements: (arr) => {
        return arr.join(' ').split(' ').reduce((result, word) => {
            if (result.indexOf(word) === -1) {
                result += word + ' '
                return result
            }
            return result
        }, '').split(' ')
    },

    /*
    * VALIDATE-QUERY: This one is to validate any string used to
    *                 query the Database. It returns a string of
    *                 valid words to query.
    *
    */

    convertString: (query) => {
        return query.toString()
            .toUpperCase()
            .trim()
            .split(' ')
            .filter(word => word.length !== 0)
            .join(' ')
    },

    isTruthy: (el) =>
        el !== undefined && el !== null && el.length !== 0,

    isObject: (el) =>
        el !== null && typeof el === 'object',

    isGreaterNumber: (a, b) =>
        typeof a === 'number' && a > b,

    encryptPassword: (password) =>
        new Promise((resolve, reject) => {
            bcrypt.hash(password, 11, (error, hash) => {
                error ? reject(new Error('error on encryptPassword!')) : resolve(hash)
            })
        }),

    /*
    * WRAP-ASYNC: function that wraps a middleware in order to test it properly. It takes a middleware
    *             as an argument, having this middleware a request, response and next object
    *             arguments. 
    * 
    */

    wrapAsync: (fn) =>
        (req, res, next) =>
            fn(req, res, next)
                .then(() => next())
                .catch((err) => {
                    return next(err)
                })   
}