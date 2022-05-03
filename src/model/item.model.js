const mongoose = require('../db/mongoose.db.js')

const ItemSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    estimatedPrice:{
        type: Number
    },
    quantity:{
        type: Number,
        required: true
    },
    referencePicture:{
        type: [String]
    },
    orderId:{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Order'
    }
},{
    versionKey: false
})

const Item = mongoose.model('Item', ItemSchema)

module.exports = Item