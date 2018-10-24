const { populateCollection, clearCollection } = require('./collection')
const { populateUsers, setupUsers } = require('./user')
module.exports = {
    populateCollection,
    populateUsers,
    setupUsers,
    teardown,
    clearCollection
}
