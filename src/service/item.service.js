const BadRequestException = require('../exception/BadRequest.exception')
const NotFoundException = require('../exception/NotFound.exception')

const Item = require('../model/item.model')
const Buyer = require('../model/buyer.model')

const { getOrderById } = require('../service/order.service')

const findAllByOrderId = async (orderId, buyerId) => {
    try{
        if(!orderId && !buyerId){
            throw new BadRequestException('require orderId and buyerId.')
        }

        const order = await getOrderById(orderId, buyerId)

        const items = await Item.find({
            orderId: order._id
        }).populate({
            path: 'itemDetail',
            model: 'ItemDetail'
        })

        return items
    }catch(error){
        throw error
    }
}

const findByItemId = async (itemId, buyerId) => {
    try{
        const item = await Item.findById(itemId).populate({
            path: 'itemDetail',
            model: 'ItemDetail'
        })

        if(!item){
            throw new NotFoundException(`Item id: ${itemId} not found.`)
        }

        const buyer = await Buyer.findOne({_id: buyerId}).populate('orders')

        const hasFound = buyer.orders.some(order => order._id.toString() === item.orderId.toString())
        
        if(!hasFound){
            throw new NotFoundException(`Item id: ${itemId} not found.`)
        }

        return item
    }catch(error){
        throw error
    }
}

const createItem = async (data, orderId, buyerId) => {
    try{
        const requireField = ['name', 'type', 'description', 'quantity', 'orderId']
        const hasNull = []

        if(!data){
            throw new BadRequestException(`require ${requireField.toString()} field.`)
        }

        requireField.forEach(key => {
            if(!data[key]){
                hasNull.push(key)
            }
        })

        if(hasNull.length !== 0){
            throw new BadRequestException(`${hasNull.toString()} are required.`)
        }

        const order = await getOrderById(orderId, buyerId)

        const item = await Item.create({
            ...data,
            orderId: order._id
        })

        return item
    }catch(error){
        throw error
    }
}

const updateItem = async (data, itemId, buyerId) => {
    try{
        await findByItemId(itemId, buyerId)

        const updateField = ['name', 'type', 'description', 'estimatedPrice', 'quantity']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        if(Object.keys(filteredData).length === 0){
            throw new BadRequestException('require field.')
        }

        const updatedItem = await Item.findByIdAndUpdate(itemId, {
            ...filteredData
        },{
            new: true,
            runValidators: true
        })

        return updatedItem
    }catch(error){
        throw error
    }
}

const deleteItem = async (itemId, buyerId) => {
    try{
        const deletedItem = await findByItemId(itemId, buyerId)

        await deletedItem.remove()

        return deletedItem
    }catch(error){
        throw error
    }
}

module.exports = {
    findAllByOrderId,
    findByItemId,
    createItem,
    updateItem,
    deleteItem
}