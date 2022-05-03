const NotFoundException = require('../exception/NotFound.exception')

const Buyer = require('../model/buyer.model.js')

const findById = async (id) => {
    try{
        const buyer = await Buyer.findById(id)

        if(!buyer){
            throw new NotFoundException(`Buyer id: ${id} not found.`)
        }

        return buyer
    }catch(error){
        throw error
    }
}

module.exports = {
    findById
}