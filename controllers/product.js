const Product = require('../models/product');
const path = require('path');
const fs = require('fs');
// Create a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, manufacturer, packaging,category } = req.body;

    // Save the file path to the database (relative path)
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      manufacturer,
      packaging,
      category,
      imagePath, // Store the image path
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};
exports.getAllProducts = async (req, res) => {
  try {
    const { name, category, mg, manufacturer } = req.query;
    
    // Build the query object dynamically
    let query = {};

    // Filter by product name (case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    // Filter by category (case-insensitive)
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Filter by mg (dosage), assuming it's a number or string
    if (mg) {
      query.packaging = { $regex: mg, $options: 'i' };
    }

    // Filter by manufacturer (case-insensitive)
    if (manufacturer) {
      query.manufacturer = { $regex: manufacturer, $options: 'i' };
    }

    // Fetch products based on query
    const products = await Product.find(query);

    // If no products found and search term was provided, return all products
    if (products.length === 0 && name) {
      const allProducts = await Product.find(); // Fetch all products if no match
      return res.status(200).json(allProducts); // Return all products
    }

    res.status(200).json(products); // Return the filtered products or all if no search query
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product); // Send the product as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, manufacturer, packaging,category } = req.body;
    let updatedFields = { name, description, price, quantity, manufacturer, packaging,category };

    if (req.file) {
      // If a new image is uploaded, update the imagePath
      updatedFields.imagePath = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(updatedProduct); // Send the updated product as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.imagePath) {
      const imagePath = path.resolve(__dirname, '..', product.imagePath.replace(/^\/+/, ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      } else {
        console.error('Image file not found at:', imagePath);
      }
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};