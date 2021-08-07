const mongoose = require('mongoose');

const options = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
}


const connection = mongoose.createConnection('mongodb://mongo/test', options);


const models = {};

const result = new mongoose.Schema({
  complete: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '대기 중'
  }
})

models.Result = connection.model('Result', result);

module.exports = models