const express = require('express')
const router = new express.Router()

const BadRequestException = require('../exception/BadRequest.exception.js')

const { createBuyer, verifyLogin, updateBuyer, addToken, uploadAvatar, getAvatar, deleteToken } = require('../service/buyer.service.js')
const { generateRefreshToken, generateAccessToken } = require('../service/token.service.js')
const { verifyAuthAT: authATBuyer,
        verifyAuthRT: authRTBuyer } = require('../middleware/buyer.auth.middleware.js')

const upload = require('../util/upload.util.js')

router.get('/profile', authATBuyer, (req, res, next) => {
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

router.put('/update', authATBuyer, async (req, res, next) => {
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

router.get('/authenticate', authRTBuyer, async (req, res, next) => {
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

router.delete('/logout', authRTBuyer, async (req, res, next) =>{
    try{
        await deleteToken(req.buyer._id, req.token)

        res.send({
            data:{
                message: 'logout successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/uploadAvatar', authATBuyer, upload.single('avatar'), async (req, res, next) => {
    try{
        const avatar = await uploadAvatar(req.file, req.buyer._id)

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

router.get('/getAvatar', authATBuyer, async (req, res, next) => {
    try{
        const dataStream = await getAvatar(req.buyer._id)
        
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