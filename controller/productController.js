const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const { deletefilewithfoldername } = require("../utils/util");

const uploadPath = path.join(__dirname, "../public/uploads/productImages");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
  addProduct: async (req, res) => {
    try {
      // const {
      //   shopId,
      //   productName,
      //   originalPrice,
      //   offerPrice,
      //   offerPercentage,
      //   description,
      // } = req.body;
      // if (!req.file) {
      //   return res.status(400).json({ message: "product image is required" });
      // }
      // if (
      //   !shopId ||
      //   !productName ||
      //   !originalPrice ||
      //   !offerPrice ||
      //   !offerPercentage ||
      //   !description
      // ) {
      //   await deletefilewithfoldername(uploadPath, req.file);
      //   res.status(400).json({
      //     status: "failed",
      //     message: "data is missing while uploading the product details...!",
      //   });
      // }
      const productData = {
        ...req.body,
        image:req.file ? req.file.filename : null
      }
      const savedProduct = await Product.create(productData);
      if (!savedProduct) {
        res.status(404).json(error.message);
      }
      res.status(200).json({
        success: "SUCCESS",
        result: savedProduct,
      });
    } catch (error) {
      // await deletefilewithfoldername(uploadPath, req.file);
      console.log(error);
      res.status(401).json({
        status: "FAILED",
        message: "An error occured while adding the product",
      });
    }
  },
  editProduct:async(req,res)=>{
    try {
        const { id } = req.params; // Get product ID from request params
        const {
          userId,
          shopId,
          productName,
          originalPrice,
          offerPrice,
          offerPercentage,
          description,
        } = req.body;
    
        // Check if product exists
        let product = await Product.findByPk(id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        // // Validate required fields
        // if (!productName || !originalPrice || !shopId) {
        //   return res.status(400).json({
        //     message: "Missing required fields: productName, originalPrice, or shopId",
        //   });
        // }
    
        // Ensure prices are valid numbers
        // if (isNaN(originalPrice) || (offerPrice && isNaN(offerPrice))) {
        //   return res.status(400).json({ message: "Invalid price values" });
        // }
    
        // Ensure offerPercentage is within valid range
        // if (offerPercentage && (offerPercentage < 0 || offerPercentage > 100)) {
        //   return res
        //     .status(400)
        //     .json({ message: "offerPercentage must be between 0 and 100" });
        // }
    
        // Handle Image Upload

        let newImage = product.image; // Keep old image by default
        if (req.file) {
        // Delete old image if exists
          if (product.image) {
            const oldImagePath = path.join(uploadPath, product.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
    
          // Assign new image filename
          newImage = req.file.filename;
        }
    
        // Update product data
        await product.update({
          shopId,
          productName,
          originalPrice,
          offerPrice: offerPrice || product.offerPrice,
          offerPercentage: offerPercentage || product.offerPercentage,
          description: description || product.description,
          image: newImage, // Updated image if applicable
        });
    
        res.status(200).json({ message: "Product updated successfully", product });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal Server Error", error });
      }
  },
  getProducts:async(req,res)=>{
    try {
        // Fetch all products from the database
        const products = await Product.findAll({
          order: [["createdAt", "DESC"]], // Order by latest created products
        });
    
        // Check if products exist
        if (!products.length) {
          return res.status(404).json({ message: "No products found" });
        }
    
        res.status(200).json({ message: "Products fetched successfully", products });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error", error });
      }
  },
  getProductById:async(req,res)=>{
    try {
        const { id } = req.params; // Extract product ID from request params
    
        // Find product by ID
        const product = await Product.findByPk(id);
    
        // Check if product exists
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        res.status(200).json({ message: "Product fetched successfully", product });
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal Server Error", error });
      }
  },
  deleteProductById:async(req,res)=>{
    try {
        const { id } = req.params; // Extract product ID from request params
    
        // Find the product by ID
        const product = await Product.findByPk(id);
    
        // Check if product exists
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        // Update the `trash` field to `true`
        await product.update({ trash: true });
    
        res.status(200).json({ message: "Product deleted successfully (soft delete)", product });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal Server Error", error });
      }
  },
  restoreProductById:async(req,res)=>{
    try {
        const { id } = req.params; // Extract product ID from request params
    
        // Find the product by ID
        const product = await Product.findByPk(id);
    
        // Check if product exists
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        // Update the `trash` field to `true`
        await product.update({ trash: false });
    
        res.status(200).json({ message: "Product deleted successfully (soft delete)", product });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal Server Error", error });
      }
  }
};
