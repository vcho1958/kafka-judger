const asyncHandler = require('express-async-handler');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);

const { Result } = require('./mongo')
const { Kafka } = require('kafkajs')

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






app.post('/judge', asyncHandler(async (req, res) => {

  const { offset, errorCode } = await producer.send({
    topic: 'test-topic',
    messages: [
      { value: 'Hello KafkaJS user!' },
    ],
  })
  await Result.create({ offset: offset });
  if (+errorCode) next(errorCode); //https://kafka.apache.org/0100/protocol.html#protocol_error_codes

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


io.sockets.on('connection', function (socket) {
  //사실상 채점현황 전용입니다.
  //굳이 kafka에서 처리했던 offset이름인 room에 들어가게하는 이유는
  //나중에 채점정보관련 모델을 구성했을 때 offset을 프로퍼티에 지정하고
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
    socket.to(offset).emit('judge-started')
  }))
  socket.on('doing-judge', (offset, message) => {
    //추후 채점과정 추가시 consumer(judger)측에서 일정 주기로 input파일 실행한 수/전체 개수 * 100 (%)를 메세지로 보냄
    socket.to(offset).emit('judge-doing', message)
  })
  socket.on('judge-end', asyncHandler(async (_id, message) => {
    //정상종료 혹은 에러메세지를 consumer(judger)측에서 보냄
    const document = await Result.findById(_id);
    document.complete = true;
    document.message = message;
    await document.save()
    await socket.to(offset).emit('judge-ended', message)
    //웹 클라이언트 측에서 이 메세지를 받아서 표시중인 메세지를 업데이트한다.
    /*const sockets = await io.in(offset).fetchSockets();
    //해당 채점결과를 한 두명이 보고 있는게 아닐 수 있으므로
    //소켓 연결을 끊는다.
    for (let socket of sockets) {
      socket.leave(offset);
    }*/
    //생각해보니 클라이언트가 단말이니 클라이언트 측에서 수신하고 클라이언트 측이 끄는 게 맞는 것 같습니다.
  }))

})



