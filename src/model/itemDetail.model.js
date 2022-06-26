const mongoose = require('../db/mongoose.db.js')

const itemDetailSchema = new mongoose.Schema({
    status:{
        type: String,
        required: true,
        enum: ['FOUND', 'NOT_FOUND']
    },
    actualPrice:{
        type: Number
    },
    actualQuantity:{
        type: Number,
        min: 1
    },
    referencePicture:{
        type: [String]
    },
    itemId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item'
    }
},{
    versionKey: false
})

const ItemDetail = mongoose.model('ItemDetail', itemDetailSchema)

module.exports = ItemDetail