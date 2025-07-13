const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/saveUser", async (req, res) => {
  try {
    const { fullName, email, profilePicture, googleId, accountType } = req.body;

    // Validate required fields
    if (!fullName || !email || !googleId) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields. Please provide fullName, email, and googleId." 
      });
    }

    let user = await User.findOne({ googleId });
    
    if (user) {
      // Update existing user
      user.fullName = fullName;
      user.email = email;
      user.profilePicture = profilePicture || user.profilePicture;
      user.accountType = accountType || user.accountType;
      user.updatedAt = new Date();
      
      await user.save();
      
      console.log(`User updated: ${email} (${googleId})`);
      
      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture,
          accountType: user.accountType,
          mobile: user.mobile,
          address: user.address,
          isProfileComplete: user.isProfileComplete,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } else {
      const newUser = new User({
        fullName,
        email,
        profilePicture,
        googleId,
        accountType: accountType || 'Google'
      });

      const savedUser = await newUser.save();
      
      console.log(`New user created: ${email} (${googleId})`);
      
      return res.status(201).json({
        success: true,
        message: "User profile created successfully",
        user: {
          id: savedUser._id,
          fullName: savedUser.fullName,
          email: savedUser.email,
          profilePicture: savedUser.profilePicture,
          accountType: savedUser.accountType,
          mobile: savedUser.mobile,
          address: savedUser.address,
          isProfileComplete: savedUser.isProfileComplete,
          isFirstTime: true,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt
        }
      });
    }
  } catch (err) {
    console.error("Error saving user:", err);

    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(409).json({ 
          success: false,
          error: "Email already exists with a different Google account"
        });
      }
      if (err.keyPattern && err.keyPattern.googleId) {
        return res.status(409).json({ 
          success: false,
          error: "Google account already registered"
        });
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: "Internal server error. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /api/updateProfile - Update user profile with address and mobile
router.post("/updateProfile", async (req, res) => {
  try {
    const { googleId, mobile, address } = req.body;

    // Validate required fields
    if (!googleId) {
      return res.status(400).json({ 
        success: false,
        error: "Google ID is required" 
      });
    }

    let user = await User.findOne({ googleId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Update user profile
    if (mobile) user.mobile = mobile;
    if (address) {
      user.address = {
        addressLine: address.addressLine || user.address?.addressLine,
        landmark: address.landmark || user.address?.landmark,
        pincode: address.pincode || user.address?.pincode
      };
    }

    // Check if profile is complete
    user.isProfileComplete = !!(user.mobile && user.address?.addressLine && user.address?.pincode);
    user.updatedAt = new Date();
    
    await user.save();
    
    console.log(`User profile updated: ${user.email} - Complete: ${user.isProfileComplete}`);
    
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        mobile: user.mobile,
        address: user.address,
        isProfileComplete: user.isProfileComplete,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error. Please try again later.",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); 
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.get("/google/:googleId", async (req, res) => {
  try {
    const { googleId } = req.params;
    const user = await User.findOne({ googleId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("Error fetching user by Google ID:", err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;