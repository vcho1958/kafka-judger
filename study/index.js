const asyncHandler = require('express-async-handler');
const app = require('./app');
const http = require('http').createServer(app);
const { Result } = require('./mongo');
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4500",
    methods: ["GET", "POST"],
    credentials: true
  }
});;





io.on('connection', function (socket) {
  //사실상 채점현황 전용입니다.
  //굳이 _id인 room에 들어가게하는 이유는
  //웹 클라이언트측이 채점현황 게시판에 접속해 채점현황을 http요청으로 불러왔을 때 
  //완료된 상태(오류, 혹은 정답)가 아닌 경우 해당 offset인 room에
  //web-client측이 join할 수 있게 하기 위함임
  socket.on('web-request', (_id) => {
    console.log('wr');
    socket.join(_id);
    console.log(_id);
  })
  socket.on('judge-start', asyncHandler(async (_id) => {
    //kafka-consumer측 클라에서 파티션으로부터 메세지를 성공적으로 받아왔을 때 socket.emit('judge-start', offset) 전송
    console.log('js')
    const document = await Result.findById(_id);
    document.message = '채점 중'
    await document.save();
    socket.to(_id).emit('judge-started', _id) //웹 클라쪽에서 식별할 수 있도록 _id도 전송
  }))
  socket.on('doing-judge', (_id, message, host) => {
    console.log('dj' + message)
    //추후 채점과정 추가시 consumer(judger)측에서 일정 주기로 input파일 실행한 수/전체 개수 * 100 (%)를 메세지로 보냄
    socket.to(_id).emit('judge-doing', _id, `${message}%`, host)
  })
  socket.on('judge-end', asyncHandler(async (_id, message) => {
    //정상종료 혹은 에러메세지를 consumer(judger)측에서 보냄
    console.log('je' + message)
    const document = await Result.findById(_id);
    document.complete = true;
    document.message = message;
    await document.save()
    await socket.to(_id).emit('judge-ended', _id, message)
  }))
  socket.on('disconnect-request', asyncHandler(async (socket, _id) => socket.leave(_id)));
  //웹쪽에서 완료메세지 수신 후 요청을 보내면 해당 소켓을 룸에서 제외
})


http.listen(3000, console.log);








