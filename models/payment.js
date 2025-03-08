const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true, // Ensures each payment is only recorded once
  },
  customerId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true, // Stored in smallest currency unit (e.g., cents)
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['succeeded', 'failed', 'pending'], // Possible payment statuses
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  receiptUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map, // A flexible field for storing additional info (e.g., order ID)
  },
  description: {
    type: String,
  },
  refund: {
    refundId: String,
    refundAmount: Number,
    refundedAt: Date,
  },
  error: {
    type: String, // Stores error message in case of failure
  },
  ipAddress: {
    type: String,
  },
  invoiceId: {
    type: String,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
