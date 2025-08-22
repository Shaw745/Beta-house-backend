require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 3000;
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

app.use(express.json());

// ✅ CORS configuration
app.use(
  cors()
);

app.use(
  fileUpload({ useTempFiles: true, limits: { fileSize: 10 * 1024 * 1024 } })
);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "beta gate Server is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "beta-house" });
    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
