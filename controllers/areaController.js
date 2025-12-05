const { Area } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

const createArea = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Area "name" is required.' });
    }

    const existingArea = await Area.findOne({ where: { name } });
    if (existingArea) {
      return res.status(409).json({ error: `Area "${name}" already exists.` });
    }

    const newArea = await Area.create({ name });
    res
      .status(201)
      .json({ message: "Area created successfully!", area: newArea });
  } catch (error) {
    console.error("Error in createArea:", error);
    logger.error("Error in createArea:", error);
    res
      .status(500)
      .json({ error: "Failed to create area", details: error.message });
  }
};

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

    area.name = name || area.name;
    const updatedArea = await area.save();

    res
      .status(200)
      .json({ message: "Area updated successfully!", area: updatedArea });
  } catch (error) {
    console.error("Error in updateArea:", error);
    logger.error("Error in updateArea:", error);
    res
      .status(500)
      .json({ error: "Failed to update area", details: error.message });
  }
};

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

    area.trash = true;
    await area.save();

    res.status(200).json({
      message: `Area ${area.name} (ID: ${id}) has been soft-deleted.`,
    });
  } catch (error) {
    console.error("Error in deleteArea:", error);
    logger.error("Error in deleteArea:", error);
    res
      .status(500)
      .json({ error: "Failed to delete area", details: error.message });
  }
};

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

    area.trash = false;
    const restoredArea = await area.save();

    res
      .status(200)
      .json({ message: "Area restored successfully!", area: restoredArea });
  } catch (error) {
    console.error("Error in restoreArea:", error);
    logger.error("Error in restoreArea:", error);
    res
      .status(500)
      .json({ error: "Failed to restore area", details: error.message });
  }
};

const getAreas = async (req, res) => {
  try {
    const search = req.query.search || "";
    let whereClause = { trash: false };

    if (search) {
      whereClause = { name: { [Op.like]: `%${search}%` } };
    }
    const areas = await Area.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    res.status(200).json(areas);
  } catch (error) {
    console.error("Error in getAreas:", error);
    logger.error("Error in getAreas:", error);
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
    logger.error("error in getAreaById", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAllAreas = async (req, res) => {
  try {
    const search = req.query.search || "";
    let whereClause = {};

    if (search) {
      whereClause = { name: { [Op.like]: `%${search}%` } };
    }
    const areas = await Area.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    res.status(200).json(areas);
  } catch (error) {
    console.error("Error in getAllAreas:", error);
    logger.error("Error in getAllAreas:", error);
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
  getAreas,
  getAllAreas,
  getAreaById,
};
