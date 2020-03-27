const { sequelize, Sequelize } = require("../../../utilities/db");
const { DataTypes, Model } = Sequelize;
const Address = require("./Address");
const License = require("../../license/models/License");
class User extends Model {}

User.init(
  {
    uid: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deactivated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    timestamps: true
  }
);

User.hasOne(Address, { foreignKey: "uid" });
User.hasMany(License, { foreignKey: "uid" });

module.exports = User;
