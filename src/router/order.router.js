const express = require('express')
const router = new express.Router()

const { getAllOrderByBuyerId, getOrderById, createOrder, updateOrder, getCurrentCart } = require('../service/order.service.js')
const { verifyAuthAT: authATBuyer } = require('../middleware/buyer.auth.middleware.js')

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