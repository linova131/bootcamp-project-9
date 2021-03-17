'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const {Sequelize} = require('sequelize');
const sequelize = new Sequelize({
  storage: 'fsjstd-restapi.db',
  dialect: 'sqlite',
});
const { Course, User } = require('./models');
const {authenticateUser} = require('./middleware/auth-user');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//Expect JSON response
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

//asyncHandler is a helper function that wraps routes to make the try/catch blocks more readable
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
};

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// GET /api/users, returns currently authenticated user along with 200 HTTP status code
app.get('/api/users', authenticateUser, asyncHandler(async(req, res)=>{
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
  });
}));

// POST /api/users, create a new user, set the Location header to "/" and return a 201 status code and no content
app.post('/api/users', asyncHandler(async(req, res)=> {
  try {
    await User.create(req.body);
    res.status(201).location('/').json();
  } catch (error) {
    console.log('ERROR: ', error.name);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// GET /api/courses, return a list of all courses (and User owner), 200 status code 
app.get('/api/courses', asyncHandler(async(req, res)=>{
  const courses = await Course.findAll({
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        as: 'courseOwner',
        attributes: ['firstName','lastName','emailAddress'],
      },
    ],
  });
  res.json(courses);
}));

//GET /api/courses/:id, return the corresponding course and User owner, 200 status code
app.get('/api/courses/:id', asyncHandler(async(req, res, next)=>{
  const course = await Course.findByPk(req.params.id, {
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ],
    include: [
      {
        model: User,
        as: 'courseOwner',
        attributes: ['firstName','lastName','emailAddress'],
      },
    ],
  });
  if (course) {
    res.json(course);
  } else {
    const err = new Error('Course Not Found');
    err.status = 404;
    next(err);
  }
}));

//POST /api/courses, creates a new course, sets Location header to URI of new course, and returns 201 status code and no content
app.post('/api/courses', authenticateUser, asyncHandler(async(req, res)=> {
  try {
    await Course.create(req.body);
    res.status(201).json();
  } catch (error) {
    console.log('ERROR: ', error.name);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      console.log('sequelize error handler fired');
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

//PUT /api/courses/:id, updates corresponding course and returns 204 status code and no content
//TODO add validation
app.put('/api/courses/:id', authenticateUser, asyncHandler(async(req, res, next)=> {
  try { 
    const course = await Course.findByPk(req.params.id);
    if (course) {
      const user = req.currentUser;
      if (user.id === course.userId) {  
        await course.update(req.body);
        res.status(204).json();
      } else {
        res.status(403).json();
      }
    } else {
      const err = new Error('Course Not Found');
      err.status = 404;
      next(err);
    }
  } catch (error) {
    console.log('ERROR: ', error.name);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

//DELETE /api/courses, deletes corresponding course, returns 204 status code and no content
app.delete('/api/courses/:id', authenticateUser, asyncHandler(async(req, res, next)=>{
  const course = await Course.findByPk(req.params.id);
  if (course) {
    const user = req.currentUser;
      if (user.id === course.userId) {  
        await course.destroy();
        res.status(204).json();
      } else {
        res.status(403).json();
      }
  } else {
    const err = new Error('Course Not Found');
    err.status = 404;
    next(err);
  }
}));


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// Test the database connection.
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
