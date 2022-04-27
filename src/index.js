const express = require('express')
const cors = require('cors')

const app = express()

const PORT = process.env.PORT

app.use(express.json())

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE']
}))

app.get('/health', (req, res) => {
    res.send({
        status : 'This service is healthy.'
    })
})

app.listen(PORT, () => {
    console.log(`Server are up on port ${PORT}`)
})
