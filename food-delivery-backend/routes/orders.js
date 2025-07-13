const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


router.post("/", async (req, res) => {
  try {
    const { customerName, paymentMethod, items } = req.body;

    
    if (!customerName || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: "Missing required fields. Please provide customerName, paymentMethod, and at least one item." 
      });
    }

    
    for (const item of items) {
      if (!item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ 
          error: "Invalid item data. Each item must have name, price, and quantity." 
        });
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = parseFloat((subtotal * 0.18).toFixed(2));
    const totalAmount = parseFloat((subtotal + gst).toFixed(2));
    
    
    let orderNumber;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      orderNumber = "FD-" + Math.floor(10000 + Math.random() * 90000);
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return res.status(500).json({ error: "Could not generate unique order number. Please try again." });
    }

    const newOrder = new Order({
      orderNumber,
      customerName,
      paymentMethod,
      items,
      subtotal,
      gst,
      totalAmount
    });

    const savedOrder = await newOrder.save();
    
    console.log(`New order created: ${orderNumber} for ${customerName} - Total: ₹${totalAmount}`);
    
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      ...savedOrder.toObject()
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ 
      error: "Internal server error. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 }); 
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/number/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


