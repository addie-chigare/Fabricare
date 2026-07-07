import { Settings } from "../models/settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { 
      brandName, 
      footerAbout, 
      footerEmail, 
      footerPhone, 
      footerAddress,
      laundryWashFoldPrice,
      laundryDryCleanPrice,
      laundrySteamIronPrice
    } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (brandName !== undefined) settings.brandName = brandName;
    if (footerAbout !== undefined) settings.footerAbout = footerAbout;
    if (footerEmail !== undefined) settings.footerEmail = footerEmail;
    if (footerPhone !== undefined) settings.footerPhone = footerPhone;
    if (footerAddress !== undefined) settings.footerAddress = footerAddress;
    if (laundryWashFoldPrice !== undefined) settings.laundryWashFoldPrice = Number(laundryWashFoldPrice);
    if (laundryDryCleanPrice !== undefined) settings.laundryDryCleanPrice = Number(laundryDryCleanPrice);
    if (laundrySteamIronPrice !== undefined) settings.laundrySteamIronPrice = Number(laundrySteamIronPrice);

    if (req.file) {
      settings.logo = req.file.path; // Set the uploaded image path (cloud/local)
    } else if (req.body.logo !== undefined) {
      settings.logo = req.body.logo;
    }

    await settings.save();
    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
