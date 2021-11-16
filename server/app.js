const app = require("express")();
//테스트용 https서버
//실제로 배포시 https로 배포해야한다.
const https = require('https')
const cors = require('cors')
app.use(cors())
//테스트용 http
const http = require('http')

const fs = require('fs');
// const options = {
//     key: fs.readFileSync('./private.pem'),
//     cert: fs.readFileSync('./public.pem')
// }
// const httpsServer = https.createServer(options,app)
const httpServer = http.createServer(app)
const io = require('socket.io')(httpServer,{
  cors:{
    origin:"*",
  }
})
app.set('view engine', 'ejs'); // 렌더링 엔진 모드를 ejs로 설정
app.set('views',  __dirname + '/views');    // ejs이 있는 폴더를 지정

let users = {}
let socketToRoom = {}
//방 입장인원 maximum 변수
const maximum = process.env.MAXIMUM ||8
//방이 시험모드인지 study모드인지 통신을 통해 들어옴
const rooomOption = ""
//study 모드의 경우 maximum을 4~8 명으로 정하고(유료화를 위해)
//test 모드의 경우 maximum은 찾아보기

var test_int=0;
module.exports = (app) =>{
  
}
// translate using Naver API config
var naver_client_id = 'zM8ct44XyZAzOICrS7wO';
var naver_client_secret = 'TzsZClpkcc';
var subtitle = '안녕하세요. 오늘의 수업은 수학입니다. 수업을 시작하겠습니다.'
var translatedText = ""
var translate =   function(){
  
  
}



io.on('connection',(socket)=> {
  console.log('it work?')
  socket.on('user_update',(data)=> {
    console.log("유저업데이트 체크!:"+JSON.stringify(data))
  })
  socket.on('join room',(data)=> {
    console.log('test')
    //여기서 socket.id 중복 검사 해야함
    
    //방에 인원이 1명이라도 있다면
    if(users[data.room]) {
      const length = users[data.room].length;
      //방 인원이 초과된다면 return
      if(length===maximum){
        socket.to(socket.id).emit('room_full');
        console.log("방이 꽉찼습니다.")
        return;
      }
      //방에 입장하기전에 중복체크
      if(users[data.room].filter(user=>user.id===socket.id).length>0){
        console.log("--------------Duplicate ID 입니다--------------")
        users[data.room].filter(user=>user.id===socket.id)[0].audio = data.audio
        users[data.room].filter(user=>user.id===socket.id)[0].video = data.video
        console.log(users[data.room].filter(user=>user.id===socket.id))
        
        
      }else {
        //방에 입장
        users[data.room].push({
          id:socket.id,
          email:data.email,
          nickname:data.nickname,
          roomtype:data.roomtype,
          roomowner:data.roomowner,
          audio: data.audio,
          video:data.video,
          share:data.share
        
        })
      }
     

    }else { //방에 인원이 1명도 없으면 방을 생성해준다.
      users[data.room] = [{
        id:socket.id,
        email:data.email,
        nickname:data.nickname,
        roomtype:data.roomtype,
        roomowner:data.roomowner,
        audio: data.audio,
        video:data.video,
        share:data.share

      }]
    }
    socketToRoom[socket.id] = data.room
    socket.join(data.room)
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} enter`)
    console.log("사용자들 전부:"+JSON.stringify(users[data.room]))
    console.log("방 인원수 : "+users[data.room].length+"최대 인원수  :"+maximum)
    const count = io.engine.clientsCount;
    // may or may not be similar to the count of Socket instances in the main namespace, depending on your usage
    const count2 = io.of("/").sockets.size;
    console.log("소켓 클라이언트 카운트"+count+"테스트2:"+count2)
    //나 자신의 id 뺴고 나머지를 출력하는거니까 local에선 공백이 맞음
    const mydata = users[data.room].filter(user=>user.id===socket.id)
    console.log("내 데이터 입니다"+mydata[0].audio)
    const userInThisRoom = users[data.room].filter(user=>user.id!==socket.id)
    console.log("현재 들어온 사람을 뺸 나머지 사용자들:"+JSON.stringify(userInThisRoom))
    console.log("현재 들어온 사람 아이디 = socketid= "+socket.id)
    console.log("mydata share 체크 하기"+mydata[0].share)
    io.sockets.to(socket.id).emit('all_users', userInThisRoom,mydata[0]) 

  })
  socket.on('offer',data=> {
    let sdp = data.sdp
    let offerSendId = data.offerSendId
    let offerSendEmail = data.offerSendEmail
    let offerSendnickname = data.offerSendNickname
    let audio = data.audio
    let video = data.video
    let offerroomowner = data.offerroomowner
    let share = data.share
    //사용자 말고 방장Id도 emit해주도록 작성하기
    socket.to(data.offerReciveID).emit('getOffer',{sdp,offerSendId,offerSendEmail,offerSendnickname,offerroomowner,audio,video,share})
  })
  socket.on('answer',data=> {
    let sdp = data.sdp
    let answerSendID = data.answerSendID
    socket.to(data.answerREceiveID).emit('getAnswer',{sdp,answerSendID,})
  })
  socket.on('candidate',data=> {
    let candidate = data.candidate
    let candidateSendID =data.candidateSendID
    socket.to(data.candidateReceiveID).emit('getCandidate',{candidate,candidateSendID})
  })
  socket.on('disconnect', () => {
    //나간사람
    console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    let username = ""
   
    if (room) {
      username = room.find(user => {
        if(user.id ===socket.id) return user.nickname
      })
      room = room.filter(user => user.id !== socket.id);
      
      users[roomID] = room;
      if (room.length === 0) {
          delete users[roomID];
          return;
      }
    }
  
    console.log("test"+username)
    console.log(roomID)
    socket.to(roomID).emit('user_exit', {id: socket.id,nickname:username.nickname});
    console.log(users);
    
  })
  // -------------------------------------채팅관련 --------------------------
  socket.on("message",data=> {
    console.log("----------------------채팅-----------------")
    console.log('name:'+data.nickname+'message:'+data.chatdata)
    console.log("----------------------채팅-----------------")
    test_int = test_int+1;
    console.log("test : "+test_int)
    console.log("roomID:"+socketToRoom[socket.id])
    io.to(socketToRoom[socket.id]).emit('message',data)
  })
  socket.on("sharesetting",(data)=> {
    console.log("share&& streamid체크"+data)
    io.emit("receive_sharesetting",data)
  })
   //----------------------음성인식 STT -----------------------
  
 socket.on("stt_message",data=> {
  console.log("stt_message"+data.message)
  console.log("stt_message"+data.message2)
  // if(tempmessage.findIndex(obj=>obj.nickname==""+data.nickname)+1){
  //   let i = tempmessage.findIndex(obj=>obj.nickname===data.nickname)
  //   tempmessage[i].message = data.message
  //   io.emit("receive_stt_message",tempmessage)
  // }else {
  //   tempmessage.push(data)
  //   io.emit("receive_stt_message",tempmessage)
  // }
  // console.log(tempmessage.findIndex(obj=>obj.nickname==""+data.nickname))
  io.emit("receive_stt_message",data)
})
socket.on("translate_stt_message",data=> {
  // try{
  //   const result =  translate(data.message,{to:'en'})
  //   console.log(result)
  // }catch(err){
  //   console.log(err)
  // }
  var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
  var request = require('request');
  var options = {
    url: api_url,
    form: {'source':'ko', 'target':'en', 'text':data.message},
    headers: {'X-Naver-Client-Id':naver_client_id, 'X-Naver-Client-Secret': naver_client_secret}
  };
  request.post(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      translatedText = JSON.parse(body).message.result.translatedText
      console.log("번역 :",translatedText);;
      data.message = translatedText
      io.emit("receive_translate_stt_message",data)
      
    } else {
      console.log('error = ' + response.statusCode);
    }
  });
  
  
})
//------------------------------------gaze알람 관련----------------------
// socket.on("gazealert",(data)=> {
//   const roomID = socketToRoom[socket.id];
//   let room = users[roomID];
//   let nickname = data.nickname
//   let email = data.email
//   let gazeOption = data.gazeOption
//   if(room) {
//     console.log(JSON.stringify(gazeOption))
//     room = room.filter(user => user.email === user.roomowner);
//     io.to(room[0].id).emit('receiveGazeAlert',{nickname,email,gazeOption})
//     console.log(`send to ${room[0].id} = room owner`)
//   }

// })
})






// httpsServer.listen

httpServer.listen(8080, () => {
  console.log('HTTP Server is running at 8080!');
  console.log("server is healthy")
});

module.exports = app;