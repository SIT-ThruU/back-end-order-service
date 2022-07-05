const stripe = require('stripe')(process.env.STRIPE_SK_KEY)

const Order = require('../model/order.model.js')
const Payment = require('../model/payment.model.js')

const BadRequestException = require('../exception/BadRequest.exception.js')
const NotFoundException = require('../exception/NotFound.exception.js')

const { io } = require('socket.io-client')
const chatSocket = io(`${process.env.WEB_SOCKET_URL}/chat`)

const axios = require('axios').default

const createPaymentIntent = async (orderId, carrierId, roomId, shippingAddress) => {
    try{

        if(!roomId){
            throw new BadRequestException('required roomId')
        }

        const order = await Order.findOne({
            _id: orderId,
            carrierId: carrierId
        }).populate({
            path: 'items',
            populate: {
                path: 'itemDetail',
                model: 'ItemDetail'
            }
        }).populate({
            path: 'buyer',
            select: ['title', 'fname', 'lname', 'telNumber', 'email']
        }).populate({
            path: 'payments'
        })

        if(!order){
            throw new NotFoundException(`Order id: ${orderId} not found.`)
        }else if(order.status !== 'IN_PROGRESS_SHOPPING'){
            throw new BadRequestException('Order not allowed to create payment')
        }else if(!shippingAddress){
            throw new BadRequestException('require shippingAddress.')
        }

        let customer = {}

        if(order.payments.length !== 0){

            const hasFoundInProgress = order.payments.some(payment => payment.status === 'IN_PROGRESS')

            if(hasFoundInProgress){
                throw new BadRequestException(`this order: ${orderId} had paymentIntent already.`)
            }

            const hasFoundSuccess = order.payments.some(payment => payment.status === 'SUCCESSFUL')

            if(hasFoundSuccess){
                throw new BadRequestException(`this order: ${orderId} had sucess paymentIntent already.`)
            }

            customer.id = order.payments[0].customerId
        }else{
            const email = order.buyer.email
            const title = order.buyer.title
            const fname = order.buyer.fname
            const lname = order.buyer.lname

            customer = await stripe.customers.create({
                email,
                name: `${title} ${fname} ${lname}`
            })
        }

        let amount = 0
        
        order.items.forEach(item => {

            if(!item.itemDetail){
                throw new BadRequestException('require itemDetail.')
            }
            else if(item.itemDetail.referencePicture.length === 0){
                throw new BadRequestException('require referencePicture in itemDetail at least 1.')
            }

            amount += (item.itemDetail.actualPrice * item.itemDetail.actualQuantity)
        })

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'thb',
            customer: customer.id,
            payment_method_types: ['card']
        })

        const payment = await Payment.create({
            paymentIntentId: paymentIntent.id,
            customerId: customer.id,
            orderId: order._id,
            amount,
            shippingAddress
        })

        const response = await axios.post(`${process.env.CHAT_URL}/room/createRoom`,{
            carrierId: order.carrierId,
            buyerId: order.buyerId
        })

        await stripe.paymentIntents.update(paymentIntent.id,{
            metadata:{
                orderId: order._id.toString(),
                paymentId: payment._id.toString(),
                roomId: response.data.data.room._id.toString()
            }
        })

        chatSocket.emit('sendMessage', {
            carrierId,
            roomId: response.data.data.room._id,
            messageType: 'PAYMENT_MODAL',
            paymentModal: {
                orderId: order._id,
                paymentId: payment._id,
                status: payment.status
            }
        },(error)=>{
            if(error){
                throw error
            }
        })

        await Order.findByIdAndUpdate(order._id,{
            status: 'WATING_FOR_PAYMENT'
        },{
            runValidators: true
        })

        return payment
    }catch(error){
        throw error
    }
}

const confirmPayment = async (orderId, paymentId, roomId) => {
    try{
        const order = await Order.findByIdAndUpdate(orderId, {
            status: 'PAYMENT_SUCCESSFUL'
        },{
            runValidators: true,
            new: true
        })

        const payment = await Payment.findByIdAndUpdate(paymentId,{
            status: 'SUCCESSFUL'
        },{
            runValidators: true,
            new: true
        })
        
        chatSocket.emit('sendMessage', {
            buyerId: order.buyerId,
            roomId: roomId,
            messageType: 'PAYMENT_MODAL',
            paymentModal: {
                orderId: order._id,
                paymentId: payment._id,
                status: payment.status
            }
        },(error)=>{
            if(error){
                throw error
            }
        })

    }catch(error){
        throw error
    }
}

module.exports = {
    createPaymentIntent,
    confirmPayment
}