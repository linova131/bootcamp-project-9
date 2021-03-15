const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: Sequelize.STRING,
    emailAddress: Sequelize.STRING,
    password: Sequelize.STRING,
  }, {sequelize});

  //Associates will go here
  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: 'courseOwner',
      foreignKey: 'userId',
    });
  };


  return User;
};