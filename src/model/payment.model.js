const mongoose = require('../db/mongoose.db.js')

const PaymentSchema = new mongoose.Schema({
    paymentIntentId:{
        type: String,
        required: true
    },
    customerId:{
        type: String,
        required: true
    },
    orderId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    shippingAddress:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: 'IN_PROGRESS',
        enum: ['IN_PROGRESS', 'SUCCESSFUL', 'FAILED']
    }  
},{
    versionKey: false
})

const Payment = mongoose.model('Payment', PaymentSchema)

module.exports = Payment
