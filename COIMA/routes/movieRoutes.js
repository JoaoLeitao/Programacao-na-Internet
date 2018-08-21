'use strict'

const express = require('express')
const router = express.Router()
const dataSource = require('../datasource/dataSource')
const movieService = require('../services/movieService')(dataSource)
const commentService = require('../services/commentService')(dataSource)
const utils = require('../utils/utils')

module.exports = router

router.get('/', function(req, res, next) {
    movieService.getHome((err, data) => {
        if(err) return next(err)
        if (req.user){
            let user = {username: req.user.username}
            res.render('homepage', user)
        }
        else
            res.render('homepage')
    })
})

router.get('/search', (req, res, next) => {
    movieService.getMovies(req, (err, data) => {
        if(err) return next(err)
        if (req.user)
            data.username = req.user.username
        res.render('searchView', data)
    } )
})

router.get('/movie/:movieId', (req, res, next) => {
    req.key = '/movie/'+ req.params.movieId

    const req1 = callback => movieService.getMovie(req, (err, data) => {
        if(err) return callback(err)
        if(req.user){
            data.username = req.user.username
            data.lst = req.user.list
        }
        data.flashMessage = utils.setFlashMessageInCtxObject(req, 'addMovieInfo')
        callback(null, data)
    })

    const req2 = callback => commentService.getCommentaries(req.params, (err, data) => {
        if(err) return callback(err)
        callback(null, data)
    })

    const reqs = [req1, req2]

    utils.parallelRequests(reqs, (err, data) => {
        if(err) return next(err)
        const finalData = data[0]
        finalData.comment = data[1]
        res.render('singleMovie', finalData)
    })
})

router.get('/actor/:actorId', (req, res, next) => {
    req.key = '/actor/'+ req.params.actorId
    movieService.getActor(req, (err, data)=> {
        if(err) return next(err)
        if (req.user)
            data.username = req.user.username
        res.render('actorView', data)
    })
})