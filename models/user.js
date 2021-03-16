const Sequelize = require('sequelize');
const bcryptjs = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a first name.',
        },
        notEmpty: {
          msg: 'Please provide a first name.',
        },
      },
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a last name.',
        },
        notEmpty: {
          msg: 'Please provide a last name.',
        },
      },
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a valid email address.',
        },
        notEmpty: {
          msg: 'Please provide a valid email address.',
        },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      set(val) {
          const hashedPassword = bcryptjs.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
      },
      validate: {
        notNull: {
          msg: 'Please provide a valid password.',
        },
        notEmpty: {
          msg: 'Please provide a valid password.',
        },
      },
    },
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