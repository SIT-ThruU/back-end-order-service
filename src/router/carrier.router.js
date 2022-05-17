const express = require('express')
const router = new express.Router()

const { createCarrier, updatecarrier, addToken, verifyLogin, deleteToken, uploadAvatar, getAvatar } = require('../service/carrier.service.js')
const { generateAccessToken, generateRefreshToken } = require('../service/token.service.js')
const { verifyAuthAT: authATCarrier,
        verifyAuthRT: authRTCarrier } = require('../middleware/carrier.auth.middleware.js')

const upload = require('../util/upload.util.js')

router.get('/profile', authATCarrier, (req, res, next) => {
    try{
        res.send({
            data:{
                carrier: req.carrier
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/create', async (req, res, next) => {
    try{
        const carrier = await createCarrier(req.body)
        
        const refreshToken = await generateRefreshToken(carrier._id.toString())

        const accessToken = await generateAccessToken(carrier._id.toString())

        await addToken(carrier._id, refreshToken)

        res.status(201).send({
            data:{
                carrier,
                tokenType: 'Bearer',
                refreshToken,
                accessToken
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/update', authATCarrier, async (req, res, next) => {
    try{
        const updatedCarrier = await updatecarrier(req.body, req.carrier._id)
        
        res.send({
            data: {
                carrier: updatedCarrier,
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
        
        const carrier = await verifyLogin(req.body.email, req.body.password)

        const refreshToken = await generateRefreshToken(carrier._id.toString())

        const accessToken = await generateAccessToken(carrier._id.toString())

        await addToken(carrier._id, refreshToken)

        res.status(201).send({
            data:{
                carrier,
                tokenType: 'Bearer',
                refreshToken,
                accessToken
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/authenticate', authRTCarrier, async (req, res, next) => {
    try{
        const newAccessToken = await generateAccessToken(req.carrier._id.toString())

        res.send({
            data:{
                accessToken: newAccessToken
            }
        })
    }catch(error){
        next(error)
    }
})

router.delete('/logout', authRTCarrier, async (req, res, next) => {
    try{
        await deleteToken(req.carrier, req.token)

        res.send({
            data:{
                message: 'logout successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/uploadAvatar', authATCarrier, upload.single('avatar'), async (req, res, next) => {
    try{
        const avatar = await uploadAvatar(req.file, req.carrier._id)

        res.status(201).send({ 
            data:{
                avatar,
                message: `upload ${req.file.originalname} sucessful.`
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/getAvatar', authATCarrier, async (req, res, next) => {
    try{
        const dataStream = await getAvatar(req.carrier._id)
        
        dataStream.on('data',(chunk) => {
            res.write(chunk)
        })

        dataStream.on('end', () => {
            return res.end()
        })
    }catch(error){
        next(error)
    }
})

module.exports = router