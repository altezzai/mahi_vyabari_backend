const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const userCoupon = require("./userCoupon");

const db = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

/**
 * ---------------------------------------------------------
 *  DEFINE ALL ASSOCIATIONS HERE
 * ---------------------------------------------------------
 */

const {
  Shop,
  Category,
  ShopCategory,
  Type,
  User,
  Complaint,
  Feedback,
  Product,
  Classified,
  ClassifiedImage,
  HealthcareProvider,
  VehicleService,
  Worker,
  WorkerCategory,
  ShopCoupon,
  UserCoupon,
  Area,
  Tourism,
  TourismImage,
  CouponMilestone,
  Rewards,
} = db;

// Many-to-Many → Shop ⇄ Category
User.belongsTo(Area, { foreignKey: "area_id" });
Area.hasMany(User, { foreignKey: "area_id" });

Shop.belongsToMany(Category, {
  through: ShopCategory,
  foreignKey: "shopId",
  otherKey: "categoryId",
});

Category.belongsToMany(Shop, {
  through: ShopCategory,
  foreignKey: "categoryId",
  otherKey: "shopId",
});

Type.hasMany(Category, { foreignKey: "typeId", as: "category" });
Category.belongsTo(Type, { foreignKey: "typeId", as: "type" });

User.hasMany(Complaint, { foreignKey: "userId" });
Shop.hasMany(Complaint, { foreignKey: "shopId", as: "complaints" });
Complaint.belongsTo(User, { foreignKey: "userId", as: "user" });
Complaint.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

User.hasMany(Feedback, { foreignKey: "userId" });
Feedback.belongsTo(User, { foreignKey: "userId" });
Shop.hasMany(Feedback, { as: "feedbacks", foreignKey: "shopId" });
Feedback.belongsTo(Shop, { foreignKey: "shopId" });

Shop.hasMany(Product, { foreignKey: "shopId", as: "products" });
Product.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

Category.hasMany(Classified, { foreignKey: "category", as: "itemCategory" });
Classified.belongsTo(Category, { foreignKey: "category", as: "itemCategory" });

Classified.hasMany(ClassifiedImage, {
  foreignKey: "classifiedId",
});
ClassifiedImage.belongsTo(Classified, {
  foreignKey: "classifiedId",
});

Category.hasMany(HealthcareProvider, {
  foreignKey: "subCategory",
  as: "categoryInfo",
});
HealthcareProvider.belongsTo(Category, {
  foreignKey: "subCategory",
  as: "categoryInfo",
});

Category.hasMany(VehicleService, {
  foreignKey: "category",
  as: "taxiCategory",
});
VehicleService.belongsTo(Category, {
  foreignKey: "category",
  as: "taxiCategory",
});

Worker.belongsToMany(Category, {
  through: WorkerCategory,
  foreignKey: "workerId",
});
Category.belongsToMany(Worker, {
  through: WorkerCategory,
  foreignKey: "categoryId",
});
Shop.hasMany(ShopCoupon, { foreignKey: "shopId", as: "shopCoupons" });
ShopCoupon.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

User.hasMany(UserCoupon, { foreignKey: "userId", as: "userCoupons" });
UserCoupon.belongsTo(User, { foreignKey: "userId", as: "user" });
Shop.hasMany(UserCoupon, { foreignKey: "shopId", as: "userCoupons" });
UserCoupon.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

ShopCoupon.hasMany(UserCoupon, { foreignKey: "shopId", as: "userCoupons" });
UserCoupon.belongsTo(ShopCoupon, {
  foreignKey: "shopId",
  targetKey: "shopId",
  as: "shopCoupon",
});

Area.hasMany(Shop, { foreignKey: "area_id" });
Shop.belongsTo(Area, { foreignKey: "area_id" });

Area.hasMany(Classified, { foreignKey: "area_id" });
Classified.belongsTo(Area, { foreignKey: "area_id" });

Area.hasMany(HealthcareProvider, { foreignKey: "area_id" });
HealthcareProvider.belongsTo(Area, { foreignKey: "area_id" });

Area.hasMany(Tourism, { foreignKey: "area_id" });
Tourism.belongsTo(Area, { foreignKey: "area_id" });

Area.hasMany(VehicleService, { foreignKey: "area_id" });
VehicleService.belongsTo(Area, { foreignKey: "area_id" });

Area.hasMany(Worker, { foreignKey: "area_id" });
Worker.belongsTo(Area, { foreignKey: "area_id" });

// 4. (NEW) Tourism -> TourismImage (One-to-Many)
Tourism.hasMany(TourismImage, { foreignKey: "tourismId", as: "images" });
Tourism.belongsTo(Area, { foreignKey: "area_id" });
TourismImage.belongsTo(Tourism, { foreignKey: "tourismId" });

Rewards.belongsTo(User, { foreignKey: "user_id" });
Rewards.belongsTo(CouponMilestone, { foreignKey: "milestone_id" });
Rewards.belongsTo(UserCoupon, { foreignKey: "coupon_id" });

/**
 * ---------------------------------------------------------
 * EXPORT
 * ---------------------------------------------------------
 */
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
