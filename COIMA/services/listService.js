'use strict'

module.exports = init

function init(dataSource) {

    const options = dataSource.options
    const request = dataSource.executeRequestFromDatabase

    return {
        addList,
        addMovie,
        getList,
        deleteMovie,
        deleteList,
        updateListName
    }

    function addList(data, cb) {
        const lstName = data.body.listName

        const list = {
            listId: new Date().valueOf(),
            name: lstName,
            results: []
        }

        request(data.user.username, null, (err, user) => {
            if (err) return cb(err)

            user.list.push(list)

            request(data.user.username, options(user), (err, body) => {
                if(err) return cb(err)
                cb(null, user)
            })
        })
    }

    function addMovie(data, cb) {
        const title = data.body.title
        const lst = data.user.list.find(obj => obj.listId == data.body.listId)
        const obj = {
            movieId: data.body.movieId,
            title: title,
            poster_path: data.body.posterPath ? data.body.posterPath : null
        }

        if (lst.results.find(item => item.title === title))
            return cb(null, null, 'Warning! It\'s already in that list!')

        lst.results.push(obj)

        request(data.user.username, options(data.user), (err, body) => {
            if(err) return cb(err)
            cb(null, data, 'Movie added to list!')
        })
    }

    function getList(data, cb) {

        let lst

        if(data.user.list)
            lst = data.user.list.find(obj => obj.listId == data.params.listId)

        if (!lst)
            return cb(null, null, 'List id not found')

        cb(null, lst)
    }

    function deleteMovie(data, cb) {

        const lst = data.user.list.find(obj => obj.listId == data.body.listId)

        if (!lst)
            return cb(null, null, 'List id not found')

        lst.results = lst.results.filter(obj => obj.movieId != data.body.movieId)

        request(data.user.username, options(data.user), (err, body) => {
            if(err) return cb(err)
            cb(null, data, 'Movie deleted!')
        })
    }

    function deleteList(data, cb) {

        request(data.user.username, null, (err, user) => {
            if (err) return cb(err)

            user.list = user.list.filter(obj => obj.listId != data.body.listId)

            request(data.user.username, options(user), (err, body) => {
                if(err) return cb(err)
                cb(null, user)
            })
        })
    }

    function updateListName(data, cb) {
        const newLstName = data.body.newListName
        const listId = data.body.listId

        const lst = data.user.list.find(obj => obj.listId == listId)

        lst.name = newLstName

        request(data.user.username, options(data.user), (err, body) => {
            if (err) return cb(err)
            cb(null, data, 'List name changed!')
        })
    }
}
