const { Kafka, logLevel } = require('kafkajs')
const io = require("socket.io-client");
const socket = io('http://api:3000');

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`kafka:9092`],
  clientId: `${process.env.HOSTNAME}`,
})



const topic = 'test-topic'
const consumer = kafka.consumer({ groupId: 'test-group' })
async function run() {
  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value.toString()
      const A = {};
      console.log(value);
      let start = new Date();
      socket.emit('judge-start', value)
      A[value] = setInterval(() => {
        socket.emit('doing-judge', value, (new Date() - start) / 50, process.env.HOSTNAME);
        console.log('dj' + (new Date() - start) / 50);
      }, 500);//나중에 채점 부분 들어감
      setTimeout(() => {
        clearInterval(A[value]);
        socket.emit('judge-end', value, '성공!')
        console.log('je' + value + '성공');
      }, 5000)

    },
  }).catch(async () => {
    await consumer.disconnect()
    socket.disconnect();
    process.exit(0)
  });
}
run()