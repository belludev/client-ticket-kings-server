const { sequelize, Sequelize } = require("../../../utilities/db");
const { DataTypes, Model } = Sequelize;
const User = require("../../auth/models/User");

class License extends Model {}

License.init(
  {
    lid: {
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
    }
  },
  {
    sequelize,
    timestamps: true
  }
);

// License.belongsTo(User, { foreignKey: "uid" });

module.exports = License;
