const mongoose = require('../db/mongoose.db.js')

const OrderSchema = new mongoose.Schema({
    status:{
        type: String,
        default: 'ON_CART'
    },
    latitude:{
        type: Number,
        required: true
    },
    longitude:{
        type: Number,
        required: true
    },
    buyerId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Buyer'
    }
},{
    versionKey: false
})

OrderSchema.virtual('items', {
    ref: 'Item',
    localField: '_id',
    foreignField: 'orderId'
})

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order