const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(stripeSecretKey);
const PaymentSchema = require('../models/payment');
const User = require('../models/userSchema');
exports.payment = async (req, res) => {
  const { amount, currency, email } = req.body
  const user = await User.findOne({ email: email });

  //throw error if there is no user with this email 
  
  const customerId = user.stripeCustomerId

  let customer = ''
  if (customerId !== null) {
    customer = await stripe.customers.retrieve(customerId);
  } else {
    customer = await stripe.customers.create({
      email:user.email,
      name:user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });
    user.stripeCustomerId = customer.id
    user.save()
  }
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2024-09-30.acacia' }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency,
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    // publishableKey: 'pk_test_51GiLv8F540OZ8hRRLPioJ3NouApToX5xYVC1YrDPmiShigYYZm8VXBYpv7ERfBPYKzab58CgLOjzopoWCiB432aJ00edTXox9H'
  });
};

exports.subscription = async (req, res) => {
  const { email } = req.body;
//check if the user is already subscribed
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  let customerId = user.stripeCustomerId;
  let customer = '';

  if (customerId) {
    customer = await stripe.customers.retrieve(customerId);
  } else {
    customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });
    
    user.stripeCustomerId = customer.id;
    await user.save();
  }


  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2024-09-30.acacia' }
  );

  // Create a subscription for the user
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: 'price_1QDOXvCGs6QAtxv4pg1Uhyof', // Replace with the actual Price ID associated with prod_R5ZhpDaQtg3sZu
      },
    ],
    payment_behavior: 'default_incomplete', // Payment confirmation flow
    expand: ['latest_invoice.payment_intent'], // Expand to include payment intent details
  });

  const paymentIntent = subscription.latest_invoice.payment_intent;

  // Send the paymentIntent client_secret to the frontend for confirmation
  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
  });
};
exports.cancelSubscription = async (req, res) => {
  const { email } = req.body; 

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  const customerId = user.stripeCustomerId;

  if (!customerId) {
    return res.status(400).send({ error: 'Customer ID not found for this user' });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });

  if (subscriptions.data.length === 0) {
    return res.status(404).send({ error: 'No active subscriptions found' });
  }

  const subscriptionId = subscriptions.data[0].id;

  try {
const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true,
});
console.log(canceledSubscription)
//save the cansel in my detabase 

    res.json({
      message: 'Subscription canceled successfully',
      subscription: canceledSubscription,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).send({ error: 'Failed to cancel subscription' });
  }
};

exports.freeTrial = async (req, res,next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {

      const error = new Error("Free trial has already been used");
      error.statusCode = 401;
      throw error;
    }

    if (user.isUsedTheTrial) {
      const error = new Error("Free trial has already been used");
      error.statusCode = 401;
      throw error;
    }

    user.isUsedTheTrial = true;
    await user.save();

    res.status(201).json({
      message: 'Free trial activated successfully',

    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
