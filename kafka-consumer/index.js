const ioClient = require("socket.io-client");


await consumer.connect()
await consumer.subscribe({ topic, fromBeginning: true })
await consumer.run({
  // eachBatch: async ({ batch }) => {
  //   console.log(batch)
  // },
  eachMessage: async ({ topic, partition, message }) => {
    const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
    console.log(`- ${prefix} ${message.key}#${message.value}`)
  },
})