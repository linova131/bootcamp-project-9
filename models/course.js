const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    estimatedTime: Sequelize.STRING,
    materialsNeeded: Sequelize.STRING,
    //userId which will be created in the model associations
  }, {sequelize});

  //Associates will go here
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'courseOwner',
      foreignKey: 'userId',
    });
  };


  return Course;
};