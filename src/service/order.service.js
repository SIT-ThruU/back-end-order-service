const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')

const Order = require('../model/order.model.js')

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

const getOrderById = async (orderId, buyerId) => {
    try{
        const order = await Order.findOne({
            _id: orderId,
            buyerId
        }).populate('items')

        if(!order){
            throw new NotFoundException(`Order id: ${orderId} not found.`)
        }

        return order
    }catch(error){
        throw error
    }
}

const createOrder = async (data, buyerId) => {
    try{
        const hasOrder = await Order.findOne({
            status: 'ON_CART',
            buyerId: buyerId
        })

        if(hasOrder){
            throw new BadRequestException(`Buyer id: ${buyerId} have order with ON_CART already.`)
        }

        const {latitude, longitude} = data

        const newOrder = await Order.create({
            latitude,
            longitude,
            buyerId
        })

        return newOrder
    }catch(error){
        throw error
    }
}

const updateOrder = async (data, orderId, buyerId) => {
    try{
        await getOrderById(orderId, buyerId)

        const updateField = ['status', 'latitude', 'longitude']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        const updatedOrder =  await Order.findOneAndUpdate({_id: orderId},{
            ...filteredData
        },{
            new: true,
            runValidators: true
        })

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