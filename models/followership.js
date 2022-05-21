'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Followership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  Followership.init({
    followerId: DataTypes.INTEGER,
    following_Id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Followership',
    tableName: 'Followerships',
    underscored: true
  })
  return Followership
}
