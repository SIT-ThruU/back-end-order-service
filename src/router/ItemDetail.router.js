const express = require('express')
const router = new express.Router()

const { createItemDetail, updateItemDetail } = require('../service/ItemDetail.service.js')

const { verifyAuthAT: authATCarrier } = require('../middleware/carrier.auth.middleware.js')

router.post('/create', authATCarrier, async (req, res, next) => {
    try{
        const itemDetail = await createItemDetail(req.body)

        res.status(201).send({
            data:{
                itemDetail,
                message: 'create itemDetail successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

router.put('/update/:itemDetailId', authATCarrier, async (req, res, next) => {
    try{
        const updatedItemDetail = await updateItemDetail(req.body, req.params.itemDetailId, req.carrier._id)

        res.send({
            data:{
                itemDetail: updatedItemDetail,
                message: 'update itemDetail successful.'
            }
        })
    }catch(error){
        next(error)
    }
})

module.exports = router