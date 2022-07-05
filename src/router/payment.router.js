const express = require('express')
const router = new express.Router()

const stripe = require('stripe')(process.env.STRIPE_SK_KEY)

const { createPaymentIntent, confirmPayment } = require('../service/payment.service.js')
const { verifyAuthAT: authATCarrier } = require('../middleware/carrier.auth.middleware.js')

const BadRequestException = require('../exception/BadRequest.exception.js')

const endpointSecret = process.env.STRIPE_WEB_HOOK_PAYMENT

router.post('/create', authATCarrier, async (req, res, next) => {
    try{
        await createPaymentIntent(req.body.orderId, req.carrier._id, req.body.roomId, req.body.shippingAddress)

        res.status(201).send({
          data:{
            message: 'create payment successful.'
          }
        })
    }catch(error){
        next(error)
    }
})

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res, next) => {
    const sig = req.headers['stripe-signature']
  
    let event
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    }catch(error){
      return next(new BadRequestException(`Webhook Error: ${error.message}`))
    }
  
    try{
        switch (event.type) {
            case 'payment_intent.succeeded':
              const paymentIntent = event.data.object
              const metadata = paymentIntent.metadata

              if(metadata){
                if(metadata.orderId && metadata.paymentId && metadata.roomId){
                  await confirmPayment(metadata.orderId, metadata.paymentId, metadata.roomId)
                }
              }

              break;
          }
      
        res.send()
    }catch(error){
        next(error)
    }
})

router.get('/test', async (req, res) => {
  try {

    const paymentIntent = await stripe.paymentIntents.confirm(
      'pi_3LIDDhB5lWlvs5F01BmLZKdQ',
      {payment_method: 'pm_card_visa'}
    );

    res.send({status: 'work'})
  } catch (error) {
    res.send({status: 'not work'})
  }
})

module.exports = router