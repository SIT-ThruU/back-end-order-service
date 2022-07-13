const mongoose = require('../db/mongoose.db.js')

const minioClient = require('../db/minio.db.js')

const bucket = process.env.MINIO_BUCKET_ITEM_IMAGE

require('./itemDetail.model.js')

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
    versionKey: false,
    toJSON:{
        virtuals: true
    },
    toObject:{
        virtuals: true
    }
})

ItemSchema.virtual('itemDetail', {
    ref: 'ItemDetail',
    localField: '_id',
    foreignField: 'itemId',
    justOne: true
})

ItemSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: '_id',
    justOne: true
})

ItemSchema.pre('remove', async function (next){
    try{
        const item = this

        for (let i=0;i<item.referencePicture.length;i++) {
            await minioClient.removeObject(bucket, item.referencePicture[i])
        }

        next()
    }catch(error){
        throw error
    }
})

const Item = mongoose.model('Item', ItemSchema)

module.exports = Item