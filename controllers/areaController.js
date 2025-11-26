const { Area } = require("../models");
const { Op } = require("sequelize");

const createArea = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Area "name" is required.' });
    }

    // Check if area already exists
    const existingArea = await Area.findOne({ where: { name } });
    if (existingArea) {
      return res.status(409).json({ error: `Area "${name}" already exists.` });
    }

    const newArea = await Area.create({ name });
    res
      .status(201)
      .json({ message: "Area created successfully!", area: newArea });
  } catch (error) {
    // --- UPDATED ERROR HANDLING ---
    console.error("Error in createArea:", error);
    res
      .status(500)
      .json({ error: "Failed to create area", details: error.message });
    // next(error); // <-- Removed
  }
};

// --- UPDATE AREA ---
// ... (updateArea function - no changes)
const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: `Area with ID ${id} not found.` });
    }

    if (area.trash) {
      return res.status(400).json({
        error: "Cannot update a deleted area. Please restore it first.",
      });
    }

    // Update name if provided
    area.name = name || area.name;
    const updatedArea = await area.save();

    res
      .status(200)
      .json({ message: "Area updated successfully!", area: updatedArea });
  } catch (error) {
    // --- UPDATED ERROR HANDLING ---
    console.error("Error in updateArea:", error);
    res
      .status(500)
      .json({ error: "Failed to update area", details: error.message });
    // next(error); // <-- Removed
  }
};

// --- SOFT DELETE AREA ---
// ... (deleteArea function - no changes)
const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: `Area with ID ${id} not found.` });
    }

    if (area.trash) {
      return res.status(400).json({ error: "Area is already deleted." });
    }

    // Soft delete by setting trash to true
    area.trash = true;
    await area.save();

    res.status(200).json({
      message: `Area ${area.name} (ID: ${id}) has been soft-deleted.`,
    });
  } catch (error) {
    // Note: A real app should check for foreign key constraints first
    // (e.g., check if any Shop still uses this Area)

    // --- UPDATED ERROR HANDLING ---
    console.error("Error in deleteArea:", error);
    res
      .status(500)
      .json({ error: "Failed to delete area", details: error.message });
    // next(error); // <-- Removed
  }
};

// --- RESTORE AREA ---
// ... (restoreArea function - no changes)
const restoreArea = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: `Area with ID ${id} not found.` });
    }

    if (!area.trash) {
      return res.status(400).json({ error: "Area is not deleted." });
    }

    // Restore by setting trash to false
    area.trash = false;
    const restoredArea = await area.save();

    res
      .status(200)
      .json({ message: "Area restored successfully!", area: restoredArea });
  } catch (error) {
    // --- UPDATED ERROR HANDLING ---
    console.error("Error in restoreArea:", error);
    res
      .status(500)
      .json({ error: "Failed to restore area", details: error.message });
    // next(error); // <-- Removed
  }
};

// --- (NEW) GET ALL ACTIVE AREAS ---
const getAreas = async (req, res) => {
  try {
    const search = req.query.search || "";
    let whereClause = { trash: false };

    if (search) {
      whereClause = { name: { [Op.like]: `%${search}%` } };
    }
    const areas = await Area.findAll({
      where: whereClause, // Only get non-deleted areas
      order: [["name", "ASC"]], // Order them alphabetically
    });

    res.status(200).json(areas);
  } catch (error) {
    // --- UPDATED ERROR HANDLING ---
    console.error("Error in getAreas:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve areas", details: error.message });
  }
};
const getAreaById = async (req, res) => {
  const { id } = req.params;
  try {
    const area = await Area.findByPk(id);
    if (!area) {
      return res
        .status(401)
        .json({ success: false, message: "area not found" });
    }

    res.status(200).json({ success: true, data: area });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// --- (NEW) GET ALL AREAS (FOR ADMIN) ---
const getAllAreas = async (req, res) => {
  try {
    const search = req.query.search || "";
    let whereClause = {};

    if (search) {
      whereClause = { name: { [Op.like]: `%${search}%` } };
    }
    const areas = await Area.findAll({
      where: whereClause, // <-- Changed to get all areas
      order: [["name", "ASC"]], // Get all, including trashed
    });

    res.status(200).json(areas);
  } catch (error) {
    // --- UPDATED ERROR HANDLING ---
    console.error("Error in getAllAreas:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve all areas", details: error.message });
  }
};

module.exports = {
  createArea,
  updateArea,
  deleteArea,
  restoreArea,
  getAreas, // <-- Added new method
  getAllAreas, // <-- Added new method
  getAreaById,
};
