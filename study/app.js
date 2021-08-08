const { Result } = require('./mongo')
const asyncHandler = require('express-async-handler');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const { Kafka } = require('kafkajs')
const kafka = new Kafka({
  clientId: `${process.env.HOSTNAME}`,
  brokers: ['kafka:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
})

const producer = kafka.producer();


app.use(morgan());
app.use(cors());
app.post('/judge', asyncHandler(async (req, res) => {
  const document = await Result.create({});

  const message =
    [{ value: `${document._id}` }]

  await producer.connect()
  const { errorCode } = await producer.send({
    topic: 'test-topic',
    messages: message,
  })

  await producer.disconnect()

  if (+errorCode) {
    res.send(errorCode)//https://kafka.apache.org/0100/protocol.html#protocol_error_codes
  };

  res.json(document);
}))
app.delete('/result', asyncHandler(async (req, res) => {
  const documents = await Result.deleteMany();
  res.send(documents);
}))
app.get('/result', asyncHandler(async (req, res) => {
  const documents = await Result.find();
  res.send(documents);
}))

module.exports = app;