const NotFoundException = require('../exception/NotFound.exception.js')

const Order = require('../model/order.model.js')

const { findById } = require('./buyer.service.js')

const getAllOrderByBuyerId = async (buyerId) => {
    try{

        const orders = await Order.find({
            buyerId
        })

        return orders
    }catch(error){
        throw error
    }
}

const getOrderById = async (orderId) => {
    try{

        const order = await Order.findById(orderId).populate('items')

        if(!order){
            throw new NotFoundException(`Order id: ${orderId} not found.`)
        }

        return order
    }catch(error){
        throw error
    }
}

const createOrder = async (data) => {
    try{
        const {latitude, longitude, buyerId} = data

        const buyer = await findById(buyerId)

        const newOrder = await Order.create({
            latitude,
            longitude,
            buyerId: buyer._id
        })

        return newOrder
    }catch(error){
        throw error
    }
}

const updateOrder = async (data, orderId) => {
    try{
        await getOrderById(orderId)

        const updateField = ['status', 'latitude', 'longitude']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        await Order.updateOne({_id: orderId},{
            ...filteredData
        })

        const updatedOrder = await Order.findById(orderId)

        return updatedOrder
    }catch(error){
        throw error
    }
}

module.exports = {
    getAllOrderByBuyerId,
    getOrderById,
    createOrder,
    updateOrder
}