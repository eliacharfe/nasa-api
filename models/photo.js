'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Photo.init({
    email: DataTypes.STRING,
    img_id: DataTypes.STRING,
    img_src: DataTypes.STRING,
    earth_date: DataTypes.STRING,
    sol: DataTypes.INTEGER,
    camera: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Photo',
  });
  return Photo;
};