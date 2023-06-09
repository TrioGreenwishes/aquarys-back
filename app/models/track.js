const { Sequelize, DataTypes } = require('sequelize');
const { connectAquarys } = require("../db.js")

const Track = connectAquarys.define('track', {

  // Model attributes are defined here
  id_box: DataTypes.INTEGER,
  id_producteur_dechet: DataTypes.INTEGER,
  date_heure: DataTypes.DATEONLY,
  id_zone_lavage: DataTypes.INTEGER,
  id_statut_track: DataTypes.INTEGER,
  numero_bon: DataTypes.INTEGER
}, {
  timestamps: false,
  freezeTableName: true
  // Other model options go here
});

Track.associate = function (models) {
  // Association
  Track.belongsTo(models.ProducteurDechets, { foreignKey: 'id_producteur_dechet', as: 'producteur_dechet' });
  Track.belongsTo(models.Box, { foreignKey: 'id_box', as: 'box' });
  Track.belongsTo(models.ZoneLavage, { foreignKey: 'id_zone_lavage', as: 'zone_lavage' });
  Track.belongsTo(models.StatutTrack, { foreignKey: 'id_statut_track', as: 'statut_track' });
}

module.exports = Track

Track