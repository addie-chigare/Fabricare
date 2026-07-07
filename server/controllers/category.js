import { Category } from "../models/category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ type: 1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, type, slug } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    let categorySlug = slug || `${type}-${name}`;
    categorySlug = categorySlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existing = await Category.findOne({ slug: categorySlug });
    if (existing) {
      return res.status(400).json({ message: "Category slug already exists" });
    }

    const category = await Category.create({
      name,
      type,
      slug: categorySlug,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, type, slug } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (type) category.type = type;

    if (slug) {
      let categorySlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      if (categorySlug !== category.slug) {
        const existing = await Category.findOne({ slug: categorySlug });
        if (existing) {
          return res.status(400).json({ message: "Category slug already exists" });
        }
        category.slug = categorySlug;
      }
    } else if (name || type) {
      // Re-generate slug if name or type changed and no slug was explicitly passed
      let categorySlug = `${type || category.type}-${name || category.name}`;
      categorySlug = categorySlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      if (categorySlug !== category.slug) {
        const existing = await Category.findOne({ slug: categorySlug });
        if (!existing) {
          category.slug = categorySlug;
        }
      }
    }

    await category.save();
    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
