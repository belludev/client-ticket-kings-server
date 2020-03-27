const { sequelize, Sequelize } = require("../../../utilities/db");
const { DataTypes, Model } = Sequelize;
const User = require("./User");
class Address extends Model {}

Address.init(
  {
    aid: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    uid: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "uid"
      }
    },
    street1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    street2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    timestamps: true
  }
);

// Address.belongsTo(User, { foreignKey: "uid" });

module.exports = Address;
