const jwt = require('jsonwebtoken')
const { mongoose } = require('../../db/mongoose')
const { ObjectID } = require('mongodb')

const { User } = require('../../models/User')
const { setItemCreator, saveItemToDb } = require('./helpers')

const { getRandomInt } = require('../../utils')

module.exports = {
    setupProducts: () => {
        return []
    },
    setupUsers: () => {
        const userOneId = new ObjectID()
        const userTwoId = new ObjectID()
        return [
            {
                _id: userOneId,
                email: `kameush${getRandomInt(10, 99)}@example.com`,
                password: `userOnePass${getRandomInt(10, 99)}`,
                tokens: [{
                    access: 'auth',
                    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
                }]
            },
            {
                _id: userTwoId,
                email: `jen${getRandomInt(10, 99)}@example.com`,
                password: `userTwoPass${getRandomInt(10, 99)}`,
                tokens: [{
                    access: 'auth',
                    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
                }]
            }
        ]
    },

    populateCollection: (tape, { model, user, items, skip }) => {
        tape.test(`SETUP: Populating Collection ....${model.modelName}`, skip, function (assert) {
            model.deleteMany({})
                .then(() => {
                    return model.modelName === 'User'
                        ? Promise.all(items
                            .map((item) => saveItemToDb(item, model)))
                        : Promise.all(items
                            .map((item) => setItemCreator(item, user._id))
                            .map((item) => {
                                return item
                            })
                            .map((item) => saveItemToDb(item, model)))
                })
                .then((res) => {
                    assert.true(res, 'Populate successfull')
                    assert.end()
                })
                .catch(assert.end)
        })
    },

    clearCollection: (t, { model, users, skip }) => {
        t.test('SETUP: Removing...', skip, function (assert) {
            let promiseArray = []
            for (let i = 0; i < users.length; i++) {
                let promise = model
                    .find({ _creator: users[i]._id })
                    .deleteMany({})
                promiseArray.push(promise)
            }
            Promise.all(promiseArray)
                .then((res) => {
                    assert.true(res)
                    assert.end()
                })
                .catch((error) => assert.end(error))
        })
    },

    teardown: (models, failure) => {
        let promiseArray = []
        for (let i = 0; i < models.length; i++) {
            let promise = models[i].deleteMany({})
            promiseArray.push(promise)
        }
        Promise.all(promiseArray)
            .then((res) => {
                failure ? console.log('onFailure\n', res) : console.log('onFinish\n', res)
                mongoose.models = {}
                mongoose.modelSchemas = {}
                mongoose.connection.close()
            })
    }
}
