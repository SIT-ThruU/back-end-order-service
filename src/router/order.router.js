const express = require('express')
const router = new express.Router()

const { getAllOrderByBuyerId, getOrderById, createOrder, updateOrder } = require('../service/order.service.js')

router.get('/getall', async (req, res, next) => {
    try{
        const orders = await getAllOrderByBuyerId(req.body.buyerId)

        res.send({
            data:{
                orders
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/get/:orderId', async (req, res, next) => {
    try{
        const order = await getOrderById(req.params.orderId)

        res.send({
            data:{
                order
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/create', async (req, res, next) => {
    try{
        const order = await createOrder(req.body)

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

router.put('/edit/:orderId', async (req, res, next) => {
    try{
        const updatedOrder = await updateOrder(req.body, req.params.orderId)

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

module.exports = router