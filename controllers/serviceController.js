require("../config/database");
const path = require("path");
const { Op, where, col, Transaction } = require("sequelize");
const logger = require("../utils/logger");
const { Type, Category, Service, ServiceCategory, Area } = require("../models");
const sequelize = require("../config/database");
const {
  deleteFileWithFolderName,
  compressAndSaveFile,
} = require("../utils/fileHandler");

const iconPath = "public/uploads/services/icon/";
const imgPath = "public/uploads/services/";
module.exports = {
  addServiceProfile: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      let image = null;
      let icon = null;

      if (req.files?.icon) {
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
      }
      if (req.files?.image) {
        image = await compressAndSaveFile(req.files.image[0], imgPath);
      }
      const { categories, ...data } = req.body;
      const serviceData = {
        ...data,
        image: image || null,
        icon: icon || null,
      };

      const newService = await Service.create(serviceData, { transaction: t });
      let categoryList = [];
      if (Array.isArray(req.body.categories)) {
        categoryList = req.body.categories.map((c) => parseInt(c));
      }
      if (categoryList.length > 0) {
        const serviceCategoryData = categoryList.map((category_id) => ({
          serviceId: newService.id,
          categoryId: category_id,
        }));
        await ServiceCategory.bulkCreate(serviceCategoryData, { transaction: t });
      }
      await t.commit();
      res.status(201).json({
        success: true,
        result: newService,
      });
    } catch (error) {
      await t.rollback();
      logger.error("error in addServiceProfile", error);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateServiceProfile: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const serviceId = id;
      const service = await Service.findByPk(id);
      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service profile not found" });
      }
      let icon = service.icon;
      let image = service.image;
      if (req.files?.icon) {
        const oldFilename = service.icon;
        icon = await compressAndSaveFile(req.files.icon[0], iconPath);
        if (oldFilename) {
          await deleteFileWithFolderName(iconPath, oldFilename);
        }
      }
      if (req.files?.image) {
        const oldFilename = service.image;
        image = await compressAndSaveFile(req.files.image[0], imgPath);
        if (oldFilename) {
          await deleteFileWithFolderName(imgPath, oldFilename);
        }
      }
      const { categories, ...bodyData } = req.body;
      const updatedService = await service.update(
        { ...bodyData, icon, image },
        { transaction: t }
      );
      let categoryList = [];

      if (Array.isArray(categories)) {
        categoryList = categories.map((c) => Number(c));
      }

      if (categoryList.length > 0) {
        const existingCategories = await ServiceCategory.findAll({
          where: {
            serviceId: serviceId,
          },
          transaction: t,
        });

        const existingIds = existingCategories.map((c) => c.categoryId);
        const newIds = categoryList;

        const toAdd = newIds.filter((id) => !existingIds.includes(id));
        const toRemove = existingIds.filter((id) => !newIds.includes(id));

        if (toAdd.length > 0) {
          const insertData = toAdd.map((id) => ({
            serviceId: serviceId,
            categoryId: id,
          }));
          await ServiceCategory.bulkCreate(insertData, { transaction: t });
        }

        if (toRemove.length > 0) {
          await ServiceCategory.destroy({
            where: { serviceId: serviceId, categoryId: toRemove },
            transaction: t,
          });
        }
      }
      const finalService = await Service.findByPk(updatedService.id);

      await t.commit();
      return res.status(200).json({
        success: true,
        data: finalService,
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      logger.error("error in updateServiceProfile", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  deleteServiceProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service profile not found" });
      }
      await service.update({ trash: true });
      return res.status(200).json({
        success: true,
        service,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in deleteServiceProfile", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getTrashedServiceProfiles: async (req, res) => {
    try {
      const services = await Service.findAll({
        where: { trash: true },
        attributes: [
          "id",
          "serviceName",
          "priority",
          "icon",
          "minWage",
          "trash",
          "createdAt",
        ],
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json({ success: true, data: services });
    } catch (error) {
      console.error(error);
      logger.error("error in getTrashedServiceProfiles", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  restoreServiceProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service profile not found" });
      }
      await service.update({ trash: false });
      return res.status(200).json({
        success: true,
        service,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in restoreServiceProfile", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getServiceProfiles: async (req, res) => {
    const search = req.query.search || "";
    const area_id = req.query.area_id || null;
    const category_id = req.query.category_id || null;

    const download = req.query.download || "";
    let { page = 1, limit = 10 } = req.query;
    if (download === "true") {
      page = null;
      limit = null;
    } else {
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
    }
    const offset = page && limit ? (page - 1) * limit : 0;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [{ serviceName: { [Op.like]: `%${search}%` } }],
      };
    }
    if (area_id) {
      whereCondition.area_id = area_id;
    }

    try {
      const { count, rows: services } = await Service.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: whereCondition,
        attributes: [
          "id",
          "serviceName",
          "priority",
          "icon",
          "minWage",
          "trash",
          "createdAt",
        ],
                include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
            where: category_id ? { id: category_id } : null,
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      if (!services) {
        return res
          .status(404)
          .json({ success: false, message: "Service profile not found" });
      }
      const totalPages = Math.ceil(count / limit);
      return res.status(200).json({
        success: true,
        count,
        totalPages: download === "true" ? null : totalPages,
        currentPage: download === "true" ? null : page,
        data: services,
      });
    } catch (error) {
      console.error(error);
      logger.error("error in getServiceProfiles", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getServiceProfileById: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findOne({
        where: { id },
        include: [
          {
            model: Category,
            attributes: ["id", "categoryName"],
            through: { attributes: [] },
          },
          {
            model: Area,
            attributes: ["id", "name"],
          },
        ],
      });
      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service profile not found" });
      }
      return res.status(200).json({ success: true, data: service });
    } catch (error) {
      console.error(error);
      logger.error("error in getServiceProfileById", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getServiceCategory: async (req, res) => {
    try {
      const serviceCategory = await Type.findOne({
        where: {
          typeName: "service",
        },
        attributes: [],
        include: {
          model: Category,
          attributes: ["id", "categoryName"],
          where: { trash: false },
          as: "category",
        },
      });
      return res.status(200).json({ success: true, data: serviceCategory });
    } catch (error) {
      console.log(error);
      logger.error("error in getServiceCategory", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};