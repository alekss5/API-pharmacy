const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controller
const { addProduct, getAllProducts,getProductById,updateProduct,deleteProduct } = require('../controllers/product');

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save the uploaded files in the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to the file name
  },
});

const upload = multer({ storage: storage });

// Define the route for adding a new product with image upload
router.post('/add-product', upload.single('image'), addProduct);
router.get('/products', getAllProducts);
router.get('/:id', getProductById); // Get product by ID
router.put('/:id', upload.single('image'),updateProduct); // Update product by ID with optional image
router.delete('/:id', deleteProduct); // Delete product by ID

module.exports = router;
