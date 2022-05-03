const express = require('express')
const router = new express.Router()

const { findAllByOrderId, findByItemId, createItem, updateItem, deleteItem } = require('../service/item.service')

router.get('/getall', async (req, res, next) => {
    try{
        const items = await findAllByOrderId(req.body.orderId)

        res.send({ 
            data:{
                items
            }
        })
    }catch(error){
        next(error)
    }
})

router.get('/get/:itemId', async (req, res, next) => {
    try{
        const item = await findByItemId(req.params.itemId)

        res.send({ 
            data:{
                item
            }
        })
    }catch(error){
        next(error)
    }
})

router.post('/create', async (req, res, next) => {
    try{
        const item = await createItem(req.body,req.body.orderId)
        res.status(201).send({
            data:{
                item,
                message: 'create item successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/update/:itemId', async (req, res, next) =>{
    try{
        const updatedItem = await updateItem(req.body, req.params.itemId)

        res.send({
            data:{
                item: updatedItem,
                message: 'update item successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.delete('/delete/:itemId', async (req, res, next) => {
    try{
        const deletedItem = await deleteItem(req.params.itemId)

        res.send({
            data:{
                item: deletedItem,
                message: 'delete item successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

module.exports = router