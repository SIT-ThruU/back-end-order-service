const BadRequestException = require('../exception/BadRequest.exception')

const Item = require('../model/item.model.js')
const ItemDetail = require('../model/itemDetail.model.js')

const { checkItemDetail } = require('./carrier.service.js')

const findByItemDetailId = async (itemDetailId) => {
    try{
        const itemDetail = await ItemDetail.findById(itemDetailId)

        if(!itemDetail){
            throw BadRequestException(`Item id: ${itemDetailId} not found.`)
        }

        return itemDetail
    }catch(error){
        throw error
    }
}

const createItemDetail = async (data) => {
    try{
        if(!data){
            throw new BadRequestException(`require field.`)
        }

        const item = await Item.findById(data.itemId)
        .populate({
            path: 'itemDetail',
            select: ['_id']
        }).populate({
            path: 'orderId',
            select: ['status']
        }).exec()

        if(!item){
            throw new BadRequestException(`item not found.`)
        }else if(item.orderId.status !== 'IN_PROGRESS_SHOPPING'){
            throw new BadRequestException(`item are not allow to continue shopping.`)
        }else if(item.itemDetail){
            throw new BadRequestException(`itemDetail already existed.`)
        }

        if(data.status === 'FOUND'){
            const requireField = ['actualPrice','actualQuantity']
            const hasNull = []

            requireField.forEach(key => {
                if(!data[key]){
                    hasNull.push(key)
                }
            })
    
            if(hasNull.length !== 0){
                throw new BadRequestException(`${hasNull.toString()} are required.`)
            }
        }

        const itemDetail = await ItemDetail.create({
            ...data
        })

        return itemDetail
    }catch(error){
        throw error
    }
}

const updateItemDetail = async (data, itemDetailId, carrierId) => {
    try{
        const itemDetail = await checkItemDetail(carrierId, itemDetailId)

        if(itemDetail.itemId.orderId.status !== 'IN_PROGRESS_SHOPPING'){
            throw new BadRequestException(`item are not allow to continue shopping.`)
        }
        
        const updateField = ['status', 'actualPrice', 'actualQuantity']

        const filteredData = Object.keys(data)
            .filter(key => updateField.includes(key))
            .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
            },{})

        if(Object.keys(filteredData).length === 0){
            throw new BadRequestException('require field.')
        }

        if(filteredData.status && filteredData.status === 'NOT_FOUND'){
            filteredData.actualPrice = null
            filteredData.actualQuantity = null
        }

        const updatedItemDetail = await ItemDetail.findByIdAndUpdate(itemDetailId, {
            ...filteredData
        },{
            new: true,
            runValidators: true
        })

        return updatedItemDetail
    }catch(error){
        throw error
    }
}

module.exports = {
    createItemDetail,
    updateItemDetail,
    findByItemDetailId
}