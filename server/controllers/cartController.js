import Cart from "../models/cart.model.js";
import { Product } from "../models/product.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = "", color = "" } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);

    if (!product || product.stock < quantity) {
      return res.status(400).json({
        message: "Product out of stock",
      });
    }

    let cartItem = await Cart.findOne({
      user: userId,
      product: productId,
      size: size,
      color: color
    });

    if (cartItem) {
      if (cartItem.quantity + quantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items available`,
        });
      }

      cartItem.quantity += quantity;
      await cartItem.save();

      return res.status(200).json({
        message: "Cart quantity updated",
        cart: cartItem,
      });
    }

    const newCart = await Cart.create({
      user: userId,
      product: productId,
      quantity,
      size,
      color
    });

    res.status(201).json({
      message: "Product added to cart",
      cart: newCart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER CART
export const getUserCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user.id }).populate(
      "product",
      "name price image stock"
    );

    // remove null products
    const validCart = cartItems.filter((item) => item.product !== null);

    res.status(200).json(validCart);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await Cart.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("product");

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        message: `Only ${cartItem.product.stock} items available`,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      message: "Cart updated",
      cart: cartItem,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  try {
    const deletedCart = await Cart.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // 🔐 owner check
    });

    if (!deletedCart) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      message: "Item removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
