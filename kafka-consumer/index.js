const { Kafka, logLevel } = require('kafkajs')
const io = require("socket.io-client");
const socket = io("http://localhost:3000", {
  withCredentials: true,
});

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`kafka:9092`],
  clientId: 'example-consumer',
})


const topic = 'test-topic'
const consumer = kafka.consumer({ groupId: 'test-group' })
async function run() {
  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: false })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let start = new Date();
      socket.emit('judge-start', message.value)
      timerId = setInterval(() => {
        socket.emit('doing-judge', message.value, (new Date() - start) / 50);
      }, 500);//나중에 채점 부분 들어감
      setTimeout(() => {
        clearInterval(timerId);
        socket.emit('judge-end', message.value, '성공!')
        socket.emit('disconnect');
      }, 5000)
    },
  })
}
run()