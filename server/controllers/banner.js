import { Banner } from "../models/banner.js";

export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      link: link || "/products",
      imageUrl: req.file.path,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Optional: check owner, but since only admins can hit this route, delete is fine
    await banner.deleteOne();

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
