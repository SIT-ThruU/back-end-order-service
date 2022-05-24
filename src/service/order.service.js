const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')
const InternalExpection = require('../exception/Internal.expection.js')

const Order = require('../model/order.model.js')

const { findById } = require('../service/buyer.service.js')

const { io } = require('socket.io-client')
const orderSocket = io(`${process.env.WEB_SOCKET_URL}/order`)
const carrierSocket = io(`${process.env.WEB_SOCKET_URL}/carrier`)
const chatSocket = io(`${process.env.WEB_SOCKET_URL}/chat`)

const axios = require('axios').default

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

        if(!latitude || !longitude){
            throw new BadRequestException('Require latitude, longitude field.')
        }

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

        const updateField = ['latitude', 'longitude', 'status', 'carrierId']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})
        
        if(Object.keys(filteredData).length === 0){
            throw new BadRequestException('require field.')
        }
        
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

const submitOrder = async (orderId, buyerId) => {
    try{
        if(!orderId || ! buyerId){
            throw new BadRequestException('require buyerId and orderId field.')
        }
        const order = await getOrderById(orderId, buyerId)

        if(order.carrierId){
            throw new BadRequestException('order has been already submited.')
        }

        const updatedOrder =  await updateOrder({status:'WATING_FOR_CARRIER'}, orderId, buyerId)

        const buyer = await findById(updatedOrder.buyerId)

        orderSocket.emit('requestOrder', {
            data:{
                order:{
                    latitude: updatedOrder.latitude,
                    longitude: updatedOrder.longitude,
                    orderId: updatedOrder._id,
                    buyerId:{
                    _id:   buyer._id,
                    title: buyer.title,
                    fname: buyer.fname,
                    lname: buyer.lname,
                    telNumber: buyer.telNumber
                    },
                }
            }
        })

    }catch(error){
        throw error
    }
}

const acceptMatching = async (carrierId, newOrder) => {
    try{
        if(!carrierId){
            throw new BadRequestException('require carrierId field.')
        }
        const order = await getOrderById(newOrder.orderId, newOrder.buyerId)

        if(order.carrierId){
            throw new InternalExpection('This order has matched already')
        }

        const updatedOrder =  await updateOrder({status:'IN_PROGRESS', carrierId}, newOrder.orderId, newOrder.buyerId)

        const response = await axios.post(`${process.env.CHAT_URL}/room/getRoom`,{
            carrierId,
            buyerId: newOrder.buyerId
        })

        return { 
            updatedOrder,
            room : response.data.data.room
        }
    }catch(error){
        throw error
    }
}

const findAllWatingOrder = async () => {
    try{
        const orders = await Order.find({status:'WATING_FOR_CARRIER'}).populate({
            path: 'buyerId',
            select: ['title', 'fname', 'lname', 'telNumber']
        }).exec()

        return orders
    }catch(error){
        throw error
    }
}

module.exports = {
    getAllOrderByBuyerId,
    getOrderById,
    createOrder,
    updateOrder,
    submitOrder,
    acceptMatching,
    findAllWatingOrder
}