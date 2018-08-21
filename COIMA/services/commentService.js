'use strict'

const utils = require('../utils/utils')

module.exports = init

function init(dataSource) {

    const options = dataSource.options
    const request = dataSource.executeRequestFromDatabase
    const find = dataSource.find

    return {
        addReply,
        addCommentary,
        getCommentaries
    }

    function addCommentary(data, cb) {

        const comment = initCommentary(data)

        const req1 = callback => addCommentaryInMovie(data, comment, (err, movieCommentary) => {
            if(err) return callback(err)
            return callback(null, movieCommentary)
        })

        const req2 = callback => addCommentaryInUser(data , comment, (err, body) => {
            if(err) return callback(err)
            return callback(null, body)
        })

        const reqs = [req1, req2]

        utils.parallelRequests(reqs, (err, data) => {
            if(err) return cb(err)
            data.id = comment.id
            cb(null, data)
        })
    }

    function addReply(data, cb) {
        const comment = initCommentary(data)

        const req1 = callback => addReplyInUser(data, comment, (err, userReply) => {
            if(err) return callback(err)
            return callback(null, userReply)
        })

        const req2 = callback => addReplyInMovie(data , comment, (err, movieReply) => {
            if(err) return callback(err)
            return callback(null, movieReply)
        })

        const req3 = callback => addCommentaryInUser(data , comment, (err, body) => {
            if(err) return callback(err)
            return callback(null, body)
        })

        const reqs = [req1, req2, req3]

        utils.parallelRequests(reqs, (err, data) => {
            if(err) return cb(err)
            data.id = comment.id
            cb(null, data)
        })
    }

    function addReplyInUser(data, comment, cb) {
        find(data.replyUser, (err, body) => {
            if(err) return cb(err)

            const comments = {
                hasFoundComment: false
            }
            recursiveSearch(body.comments, data.replyId, comments)
            comments.comment.responses.push(comment)

            if(data.replyUser === data.username)
                body.comments.push(comment)

            request(body.username, options(body), (err, data)=>{
                if(err) return cb(err)
                cb(null, body)
            })
        })
    }

    function addReplyInMovie(data, comment, cb) {
        find(data.movieId, (err, body) => {
            if(err) return cb(err)

            const comments = {
                hasFoundComment: false
            }
            recursiveSearch(body.comments, data.replyId, comments)
            comments.comment.responses.push(comment)

            request(body.movieId, options(body), (err, data)=>{
                if(err) return cb(err)
                cb(null, body)
            })
        })
    }

    function addCommentaryInMovie(data, comment, cb) {
        find(data.movieId, (err, body)=>{
            if(err) return cb(err)
            let toReturn

            if(body.movieId === data.movieId){
                body.comments.push(comment)
                toReturn = body
            }
            else {
                toReturn = initMovieCommentaries(data)
                toReturn.comments.push(comment)
            }

            request(toReturn.movieId, options(toReturn), (err, data)=>{
                if(err) return cb(err)
                cb(null, toReturn)
            })
        })
    }

    function addCommentaryInUser(data, comment, cb) {
        find(data.username, (err, body)=>{
            if(err) return cb(err)

            if(body.username === data.username){
                body.comments.push(comment)

                request(body.username, options(body), (err, data)=>{
                    if(err) return err
                    cb(null, body)
                })
            }
        })
    }

    function getCommentaries(data, cb) {
        const movieId = data.movieId
        find(movieId, (err, body)=>{
            if(err)  return cb(err)
            return cb(null, body)
        })
    }

    function recursiveSearch(array, replyId, toReturn) {
        if(!toReturn.hasFoundComment)
            for(let i = 0; i < array.length; ++i) {
                if(array[i].id == replyId) {
                    toReturn.comment = array[i]
                    toReturn.hasFoundComment = true
                    break
                }
                else recursiveSearch(array[i].responses, replyId, toReturn)
            }
    }

    function initCommentary(data) {
        return{
            id: new Date().valueOf(),
            username : data.username,
            comment : data.comment,
            title : data.title,
            movieId : data.movieId,
            responses : []
        }
    }

    function initMovieCommentaries(data) {
        return{
            movieId: data.movieId,
            comments: []
        }
    }
}