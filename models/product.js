const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true  },
  quantity: { type: Number, required: true  },
  manufacturer: { type: String, required: true },
  packaging: { type: String, required: true },
  category: { type: String, required: true },
  imagePath: { type: String, required: false },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
