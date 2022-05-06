const express = require('express')
const router = new express.Router()

const BadRequestException = require('../exception/BadRequest.exception.js')

const { createBuyer, verifyLogin, updateBuyer, addToken } = require('../service/buyer.service.js')
const { generateRefreshToken, generateAccessToken, deleteRefreshToken } = require('../service/token.service.js')
const { verifyAuthAT, verifyAuthRT } = require('../middleware/buyer.auth.middleware.js')

router.get('/profile', verifyAuthAT, (req, res, next) => {
    try{
        res.send({
            data:{
                buyer: req.buyer
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/create', async (req, res, next) => {
    try{
        const buyer = await createBuyer(req.body)

        const refreshToken = await generateRefreshToken(buyer._id.toString())

        const accessToken = await generateAccessToken(buyer._id.toString())

        await addToken(buyer._id, refreshToken)

        res.status(201).send({
            data:{
                buyer,
                message: 'create buyer successful.',
                tokenType: 'Bearer',
                refreshToken,
                accessToken
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/update', verifyAuthAT, async (req, res, next) => {
    try{
        const updatedBuyer = await updateBuyer(req.body, req.buyer._id)

        res.send({
            data: {
                buyer: updatedBuyer,
                message: 'update buyer successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try{
        if(!req.body.email || !req.body.password){
            throw new BadRequestException('The email or password is incorrect')
        }

        const buyer = await verifyLogin(req.body.email, req.body.password)

        const refreshToken = await generateRefreshToken(buyer._id.toString())

        const accessToken = await generateAccessToken(buyer._id.toString())

        await addToken(buyer._id, refreshToken)

        res.status(201).send({
            data:{
                buyer,
                tokenType: 'Bearer',
                refreshToken,
                accessToken
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/authenticate', verifyAuthRT, async (req, res, next) => {
    try{
        const newAccessToken = await generateAccessToken(req.buyer._id.toString())

        res.send({
            data:{
                accessToken: newAccessToken
            }
        })
    }catch(error){
        next(error)
    }
})

router.delete('/logout', verifyAuthRT, async (req, res, next) =>{
    try{
        await deleteRefreshToken(req.buyer._id, req.token)

        res.send({
            data:{
                message: 'logout successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

module.exports = router