const BadRequestException = require('../exception/BadRequest.exception')
const NotFoundException = require('../exception/NotFound.exception')
const Item = require('../model/item.model')

const { getOrderById } = require('../service/order.service')

const findAllByOrderId = async (orderId) => {
    try{
        const order = await getOrderById(orderId)

        const items = await Item.find({
            orderId: order._id
        })

        return items
    }catch(error){
        throw error
    }
}

const findByItemId = async (itemId) => {
    try{
        const item = await Item.findById(itemId)

        if(!item){
            throw new NotFoundException(`Item id: ${itemId} not found.`)
        }

        return item
    }catch(error){
        throw error
    }
}

const createItem = async (data, orderId) => {
    try{
        const requireField = ['name', 'type', 'description', 'quantity', 'orderId']
        const hasNull = []

        requireField.forEach(key => {
            if(!data[key]){
                hasNull.push(key)
            }
        })

        if(hasNull.length !== 0){
            throw new BadRequestException(`${hasNull.toString()} are required.`)
        }

        const order = await getOrderById(orderId)

        const item = await Item.create({
            ...data,
            orderId: order._id
        })

        return item
    }catch(error){
        throw error
    }
}

const updateItem = async (data, itemId) => {
    try{
        await findByItemId(itemId)

        const updateField = ['name', 'type', 'description', 'estimatedPrice', 'quantity']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        await Item.updateOne({_id: itemId}, {
            ...filteredData
        })

        const updatedItem = await findByItemId(itemId)

        return updatedItem
    }catch(error){
        throw error
    }
}

const deleteItem = async (itemId) => {
    try{
        const deletedItem = await Item.findByIdAndDelete(itemId)

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