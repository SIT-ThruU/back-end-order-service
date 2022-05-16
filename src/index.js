const express = require('express')
const cors = require('cors')

const OrderRouter = require('./router/order.router.js')
const ItemRouter = require('./router/item.router.js')
const ItemImageRouter = require('./router/itemImage.router.js')
const BuyerRouter = require('./router/buyer.router.js')
const CarrierRouter = require('./router/carrier.router.js')

const app = express()

const PORT = process.env.PORT

app.use(express.json())

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE']
}))

app.use('/order', OrderRouter)
app.use('/item', ItemRouter)
app.use('/item/image', ItemImageRouter)
app.use('/buyer', BuyerRouter)
app.use('/carrier', CarrierRouter)

app.get('/health', (req, res) => {
    res.send({
        status : 'This service is healthy.'
    })
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).json({message: err.message || 'Internal Server error', status: err.status || 500})
})

app.listen(PORT, () => {
    console.log(`Server are up on port ${PORT}`)
})
