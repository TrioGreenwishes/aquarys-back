'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id_poste: DataTypes.INTEGER,
    identifiant: DataTypes.STRING,
    mdp: DataTypes.STRING,
    id_zone_lavage: DataTypes.INTEGER   
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};