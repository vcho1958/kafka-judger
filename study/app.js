const { Result } = require('./mongo')
const asyncHandler = require('express-async-handler');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const { Kafka } = require('kafkajs')
const kafkaInit = async () => {
  const kafka = new Kafka({
    clientId: `${process.env.HOSTNAME}`,
    brokers: ['kafka:9092'],
    retry: {
      initialRetryTime: 100,
      retries: 8
    }
  })
  return kafka.producer();
}

const producer = kafkaInit();



app.use(morgan());
app.use(cors());
app.post('/judge', asyncHandler(async (req, res) => {
  const document = await Result.create({});
  const { errorCode } = await producer.send({
    topic: 'test-topic',
    messages: [
      //{ key:  } 나중에 Java나 코틀린 등 컴파일러별로 분화하여 작성해도 좋을 것 같습니다.
      { value: document._id },
    ],
  })

  if (+errorCode) {
    res.send(errorCode)//https://kafka.apache.org/0100/protocol.html#protocol_error_codes
  };

  res.send(res);
}))

app.get('/result', asyncHandler(async (req, res) => {
  const documents = await Result.find();
  res.send(documents);
}))

module.exports = app;