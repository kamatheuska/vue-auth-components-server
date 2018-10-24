module.exports = {
    setItemCreator: (item, id) => {
        item._creator = id
        return item
    },
    saveItemToDb: (item, Model) => new Model(item).save()
}