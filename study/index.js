const asyncHandler = require('express-async-handler');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4500",
    methods: ["GET", "POST"],
    credentials: true
  }
});;

const { Result } = require('./mongo')
const { Kafka } = require('kafkajs')


app.post('/judge', asyncHandler(async (req, res) => {
  const document = await Result.create({ offset: offset });
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
  // document.offset = offset
  //document.save()

  /*적재 성공 시 RecordMetadata = {
  topicName: string
  partition: number
  errorCode: number
  offset ?: string
  timestamp ?: string
  baseOffset ?: string
  logAppendTime ?: string
  logStartOffset ?: string
} 이런 객체가 반환 됨*/


}))

app.get('/result', asyncHandler(async (req, res) => {
  const documents = await Result.find();
  res.send(documents);
}))

app.use(async (req, res) => { res.send(errorCode) });

io.sockets.on('connection', function (socket) {
  //사실상 채점현황 전용입니다.
  //굳이 _id인 room에 들어가게하는 이유는
  //웹 클라이언트측이 채점현황 게시판에 접속해 채점현황을 http요청으로 불러왔을 때 
  //완료된 상태(오류, 혹은 정답)가 아닌 경우 해당 offset인 room에
  //web-client측이 join할 수 있게 하기 위함임
  socket.on('web-request', (_id) => {
    socket.join(_id);
  })
  socket.on('judge-start', asyncHandler(async (_id) => {
    //kafka-consumer측 클라에서 파티션으로부터 메세지를 성공적으로 받아왔을 때 socket.emit('judge-start', offset) 전송
    const document = await Result.findById(_id);
    document.message = '채점 중'
    await document.save();
    socket.to(_id).emit('judge-started', _id) //웹 클라쪽에서 식별할 수 있도록 _id도 전송
  }))
  socket.on('doing-judge', (_id, message) => {
    //추후 채점과정 추가시 consumer(judger)측에서 일정 주기로 input파일 실행한 수/전체 개수 * 100 (%)를 메세지로 보냄
    socket.to(_id).emit('judge-doing', _id, `${message}%`)
  })
  socket.on('judge-end', asyncHandler(async (_id, message) => {
    //정상종료 혹은 에러메세지를 consumer(judger)측에서 보냄
    const document = await Result.findById(_id);
    document.complete = true;
    document.message = message;
    await document.save()
    await socket.to(_id).emit('judge-ended', _id, message)
  }))
  socket.on('disconnect-request', asyncHandler(async (socket, _id) => socket.leave(_id)));
  //웹쪽에서 완료메세지 수신 후 요청을 보내면 해당 소켓을 룸에서 제외
})





http.listen(3000, asyncHandler(async () => {
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'],
    retry: {
      initialRetryTime: 100,
      retries: 8
    }
  })

  const producer = kafka.producer()
  await producer.connect()

}));










