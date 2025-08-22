const express = require("express");
const Property = require("../models/Property");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

// ================= CREATE =================
router.post("/", async (req, res) => {
  try {
    const { title, price, location, type, beds, baths, image } = req.body || {};
    let imageUrl = image;

    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "properties",
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!title || !price || !location || !beds || !baths) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const property = new Property({
      title,
      price,
      location,
      type,
      beds,
      baths,
      image: imageUrl,
    });

    await property.save();
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= GET ALL (with filters) =================
router.get("/", async (req, res) => {
  try {
    const { location, type, beds, baths, minPrice, maxPrice } = req.query;

    let query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" }; // case-insensitive
    }
    if (type) {
      query.type = { $regex: type, $options: "i" };
    }
    if (beds) {
      query.beds = Number(beds);
    }
    if (baths) {
      query.baths = Number(baths);
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query);
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error("Error in GET /properties:", error); // 👈 add this
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= GET SINGLE =================
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= UPDATE =================
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };

    // If image file is uploaded, upload to Cloudinary
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "properties",
      });
      updates.image = uploadResult.secure_url;
    }

    const property = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res.json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= DELETE =================
router.delete("/:id", async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
