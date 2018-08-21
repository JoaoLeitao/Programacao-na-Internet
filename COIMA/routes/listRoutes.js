'use strict'

const express = require('express')
const dataSource = require('../datasource/dataSource')
const listService = require('../services/listService')(dataSource)
const utils = require('../utils/utils')
const router = express.Router()

module.exports = router

router.post('/updateListName', (req, res, next) => {
    listService.updateListName(req, (err, data, info) => {
        if(err) return next(err)

        res.sendStatus(200)
    })
})

router.get('/list/:listId/page/:page', (req, res, next) => {
    listService.getList(req, (err, data, info) => {
        if(err) return next(err)
        if(info) return next(new Error(info))

        if (req.user)
            data.username = req.user.username

        data.results = utils.pagination(data.results, req, data, 8)

        res.render('favouritesList', data)
    })
})

router.delete('/deleteMovie', (req, res, next) => {
    listService.deleteMovie( req, (err, data, info) => {
        if(err) return next(err)

        res.sendStatus(200)
    })
})

router.delete('/deleteList', (req, res, next) => {
    listService.deleteList( req, (err, data, info) => {
        if(err) return next(err)

        res.sendStatus(200)
    })
})

router.post('/addLst', (req, res, next) => {

    const lst = {
        listId : '',
        name : req.body.listName,
        results: []
    }
    const ctx = { layout: false }
    Object.assign(ctx, lst)

    listService.addList(req, (err, data, info) => {
        if(err) return next(err)
        if(info) return next(new Error(info))

        ctx.listId = data.list.slice(-1)[0].listId // para apanhar o ultimo listId

        res.render('partials/favouriteList', ctx)
    })
})

router.post('/addMovie', (req, res, next) => {
    listService.addMovie(req, (err, data, info) => {
        if(err) return next(err)

        return res.send(info)
    })
})