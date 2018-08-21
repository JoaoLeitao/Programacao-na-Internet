'use strict'

const express = require('express')
const passport = require('passport')
const dataSource = require('../datasource/dataSource')
const userService = require('../services/userService')(dataSource)
const utils = require('../utils/utils')
const router = express.Router()

module.exports = router

router.get('/login', (req, res) => {
    if(req.user) return res.redirect('/logout')

    const contextObj = utils.setFlashMessageInCtxObject(req, 'loginError')

    res.render('login', contextObj)
})

router.get('/user/page/:page', (req, res) => {
    if(!req.user) return res.redirect('/login')

    if(req.user.list)
        req.user.list = utils.pagination(req.user.list, req, req.user, 8)

    res.render('user', req.user)
})

router.get('/logout',(req, res) => {
    res.render('logout', req.user)
})

router.get('/signUp', (req, res) => {
    if(req.user) return res.redirect('/logout')
    const contextObj = utils.setFlashMessageInCtxObject(req, 'signUpError')

    res.render('signUp', contextObj)
})

router.post('/logout', (req, res, next)=> {
    req.logout()
    res.redirect('/login')
})

router.post('/login', (req, res, next) => {
    userService.authenticate(req.body.username, req.body.password, (err, user, info) => {
        if(err) return next(err)

        if(info) {
            req.flash('loginError', info)
            return res.redirect('/login')
        }

        req.logIn(user, (err) => {
            if(err) return next(err)
            res.redirect('/user/page/1')
        })
    })
})

router.post('/signUp', (req, res, next) => {
    userService.createUser(req, (err, user, info) => {
        if(err) return next(err)

        if(info) {
            req.flash('signUpError', info)
            return res.redirect('/signUp')
        }
        req.user = user

        req.logIn(req.user, (err)=>{
            if(err) return next(err)
            res.redirect('/user/page/1')
        })
    })
})

/* ------------- PASSPORT --------*/

passport.serializeUser(function (user, cb) {
    cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
    dataSource.find(username, cb)
})