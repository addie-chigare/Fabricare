import { Product } from "../models/product.js";


export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, brand, discount, isFeatured, material, colors, sizes, images } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const parsedColors = typeof colors === "string" ? colors.split(",").map(c => c.trim()).filter(Boolean) : colors;
    const parsedSizes = typeof sizes === "string" ? sizes.split(",").map(s => s.trim()).filter(Boolean) : sizes;
    const parsedImages = typeof images === "string" ? images.split(",").map(i => i.trim()).filter(Boolean) : images;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      brand,
      discount,
      isFeatured: isFeatured === "true" || isFeatured === true,
      material: material || "100% Premium Cotton",
      colors: parsedColors && parsedColors.length > 0 ? parsedColors : ["Navy Blue", "Charcoal Gray", "Pure White"],
      sizes: parsedSizes && parsedSizes.length > 0 ? parsedSizes : ["S", "M", "L", "XL"],
      images: parsedImages && parsedImages.length > 0 ? parsedImages : [req.file.path],
      image: req.file.path, 
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPublicProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "username");

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "username");

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "username");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, brand, discount, isFeatured, material, colors, sizes, images } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (product.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.brand = brand !== undefined ? brand : product.brand;
    product.discount = discount !== undefined ? discount : product.discount;
    product.material = material !== undefined ? material : product.material;
    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    if (colors !== undefined) {
      const parsedColors = typeof colors === "string" ? colors.split(",").map(c => c.trim()).filter(Boolean) : colors;
      product.colors = parsedColors;
    }

    if (sizes !== undefined) {
      const parsedSizes = typeof sizes === "string" ? sizes.split(",").map(s => s.trim()).filter(Boolean) : sizes;
      product.sizes = parsedSizes;
    }

    if (images !== undefined) {
      const parsedImages = typeof images === "string" ? images.split(",").map(i => i.trim()).filter(Boolean) : images;
      product.images = parsedImages;
    }

    if (req.file) {
      product.image = req.file.path;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  await product.deleteOne();

  res.json({ message: "Product deleted" });
};

export const searchProducts = async (req, res) => {
  try {
    const q = req.query.q;

    const products = await Product.find({
      name: { $regex: q, $options: "i" }
    }).limit(5);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      userId: req.user._id,
      userName: req.user.name || req.user.username,
      rating: Number(rating),
      comment,
    };

    product.reviews = product.reviews || [];
    product.reviews.push(review);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

    await product.save();
    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews = product.reviews.filter(r => r._id.toString() !== reviewId);

    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));
    } else {
      product.rating = 4.5;
    }

    await product.save();
    res.status(200).json({ message: "Review deleted successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
