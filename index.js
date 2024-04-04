const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI);

// Models
const userSchema = new mongoose.Schema({
  username: String
});

const excerciseSchema = new mongoose.Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
});

const User = mongoose.model('User', userSchema);
const Excercise = mongoose.model('Excercise', excerciseSchema);

// DB functions
function getAllUsers() {
  return User.find();
}

function createUser(username) {
  const user = new User({
    username: username
  });
  return user.save();
}

function findUserById(id) {
  return User.findById(id);
}

function createExcercise(userId, description, duration, date) {
  const excercise = new Excercise({
    userId: userId,
    description: description,
    duration: duration,
    date: date
  });
  return excercise.save();
}

//Routes
app.route('/api/users')
  .get((req, res) => {
    getAllUsers().then(users => res.json(users))
  })
  .post((req, res) => {
    const username = req.body.username;
    createUser(username).then(user => res.json(user));
  });

app.post('/api/users/:id/exercises', (req, res) => {
  const userId = req.params.id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date ? req.body.date : new Date(Date.now());
  createExcercise(userId, description, duration, date)
    .then((excercise) => {
      findUserById(userId).then(user =>
        res.json({
          _id: user._id,
          username: user.username,
          description: excercise.description,
          duration: excercise.duration,
          date: excercise.date.toDateString()
        })
      )
    });
});

app.get('/api/users/:id/logs', (req, res) => {

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
