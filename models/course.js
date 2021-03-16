const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a title for the course.',
        },
        notEmpty: {
          msg: 'Please provide a title for the course.',
        },
      },
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a description for the course.',
        },
        notEmpty: {
          msg: 'Please provide a description for the course.',
        },
      },
    },
    estimatedTime: {
      type: Sequelize.STRING,
    },
    materialsNeeded: {
      type: Sequelize.STRING,
    },
    //userId which will be created in the model associations
  }, {
      timestamps: false,
      sequelize});

  //Associates will go here
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'courseOwner',
      foreignKey: 'userId',
    });
  };


  return Course;
};