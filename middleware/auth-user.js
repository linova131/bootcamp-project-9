'use strict';

const auth = require('basic-auth');
const {User} = require('../models');
const bcryptjs = require('bcryptjs');

exports.authenticateUser = async (req, res, next) => {
  let message;
  const credentials = auth(req);
  console.log(credentials);

  if (credentials) {
    const user = await User.findOne({where: {emailAddress: credentials.name} });
    console.log(user);
    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.email}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = `Auth header not found`;
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: `Access Denied` });
  } else {
    next();
  }

};