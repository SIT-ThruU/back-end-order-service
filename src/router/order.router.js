const express = require('express')
const router = new express.Router()

const { getAllOrderByBuyerId, getOrderById, createOrder, updateOrder, submitOrder, acceptMatching, findAllWatingOrder, getCurrentCart } = require('../service/order.service.js')
const { findAllByOrderId  } = require('../service/item.service.js')
const { verifyAuthAT: authATBuyer } = require('../middleware/buyer.auth.middleware.js')
const { verifyAuthAT: authATCarrier } = require('../middleware/carrier.auth.middleware.js')
const BadRequestException = require('../exception/BadRequest.exception.js')

router.get('/getall', authATBuyer, async (req, res, next) => {
    try{
        const orders = await getAllOrderByBuyerId(req.buyer._id)

        res.send({
            data:{
                orders
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/get/:orderId', authATBuyer, async (req, res, next) => {
    try{
        const order = await getOrderById(req.params.orderId, req.buyer._id)

        res.send({
            data:{
                order
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/create', authATBuyer, async (req, res, next) => {
    try{
        const order = await createOrder(req.body, req.buyer._id)

        res.status(201).send({
            data:{
                order,
                message: 'create order successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/edit/:orderId', authATBuyer, async (req, res, next) => {
    try{
        const updatedOrder = await updateOrder(req.body, req.params.orderId, req.buyer._id)

        res.send({
            data:{
                order: updatedOrder,
                message: 'update order successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/submitOrder', authATBuyer, async (req, res, next) => {
    try{
        if(!req.query.orderId){
            throw new BadRequestException('require orderId field.')
        }
        const items = await findAllByOrderId(req.query.orderId, req.buyer._id)
        
        if(items.length === 0){
            throw new BadRequestException('require item in order.')
        }

        await submitOrder(req.query.orderId, req.buyer._id)
        
        res.send({
            data:{
                message: 'confirm order successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/acceptMatching', authATCarrier, async (req, res, next) => {
    try{
        if(!req.body.matchOrder){
            throw new BadRequestException('require matchOrder field.')
        }

        const data = await acceptMatching(req.carrier._id, req.body.matchOrder)

        res.send({
            data
        })
    }catch(error){
        next(error)
    }
})

router.get('/getAllWatingOrder', authATCarrier, async (req, res, next) => {
    try{
        const orders = await findAllWatingOrder()

        res.send({
            data: {
                orders
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/getCurrentCart', authATBuyer, async (req, res, next) => {
    try{
        const order = await getCurrentCart(req.buyer._id)

        res.send({
            data:{
                order
            }
        })
    }catch(error){
        next(error)
    }
})

module.exports = router