const express = require('express')
const router = new express.Router()

const { createCarrier, updatecarrier, addToken, verifyLogin, deleteToken, uploadAvatar, getAvatar, checkOrder } = require('../service/carrier.service.js')
const { updateOrder, getCarrierOrderById } = require('../service/order.service.js')
const { findAllByOrderId } = require('../service/item.service.js')
const { generateAccessToken, generateRefreshToken } = require('../service/token.service.js')
const { verifyAuthAT: authATCarrier,
        verifyAuthRT: authRTCarrier } = require('../middleware/carrier.auth.middleware.js')

const { io } = require('socket.io-client')
const chatSocket = io(`${process.env.WEB_SOCKET_URL}/chat`)

const upload = require('../util/upload.util.js')
const BadRequestException = require('../exception/BadRequest.exception.js')

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

router.get('/getOrder/:orderId', authATCarrier, async (req, res, next) => {
    try{
        const order = await getCarrierOrderById(req.params.orderId, req.carrier._id)

        res.send({
            data:{
                order
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/stepOTW', authATCarrier, async (req, res, next) => {
    try{
        const allowStatus = ['IN_PROGRESS_SHOPPING', 'SHOP_CLOSED']
        const status = req.body.status

        if(!req.body.orderId || !status || !req.body.roomId){
            throw new BadRequestException('require orderId, status and roomId')
        }
        
        if(!allowStatus.includes(status)){
            throw new BadRequestException('status should be only IN_PROGRESS_SHOPPING or SHOP_CLOSED.')
        }

        const order = await checkOrder(req.carrier._id, req.body.orderId)

        if(order.status !== 'IN_PROGRESS'){
            throw new BadRequestException('cannot process because order status are not IN_PROGRESS.')
        }

        const updatedOrder = await updateOrder({status}, order._id, order.buyerId)

        chatSocket.emit('sendMessage', {
            carrierId: req.carrier._id,
            roomId: req.body.roomId,
            messageType: 'ORDER_MODAL',
            orderModal: {
                orderId: updatedOrder._id,
                status: updatedOrder.status
            }
        },(error) => {
            if(error){
                throw error
            }
        })

        res.status(200).send({ 
            data:{
                message:'change status successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/previewItems', authATCarrier, async (req, res, next) => {
    try{
        const items = await findAllByOrderId(req.body.orderId, req.body.buyerId)

        res.send({
            data:{
                items
            }
        })
    }catch(error){
        next(error)
    }
})

module.exports = router