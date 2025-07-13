const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Order", OrderSchema);
