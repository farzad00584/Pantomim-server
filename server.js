const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
  cors:{ origin:"*" }
});

const rooms = {};

const words = [
 "سیب",
 "گربه",
 "ماشین",
 "فیل",
 "هواپیما",
 "کتاب",
 "پیتزا"
];

app.get("/",(req,res)=>{
 res.send("Server Online");
});

io.on("connection",(socket)=>{

 console.log("Connected:",socket.id);

 socket.on("createRoom",()=>{

   const roomCode =
   Math.floor(1000 + Math.random()*9000).toString();

   rooms[roomCode] = {
     players:[socket.id],
     scores:[0,0],
     round:1,
     totalRounds:8,
     drawer:0
   };

   socket.join(roomCode);

   socket.emit("roomCreated",roomCode);

 });

 socket.on("joinRoom",(roomCode)=>{

   if(!rooms[roomCode]){
     socket.emit("errorMsg","اتاق پیدا نشد");
     return;
   }

   if(rooms[roomCode].players.length >= 2){
     socket.emit("errorMsg","اتاق پر است");
     return;
   }

   rooms[roomCode]
   .players.push(socket.id);

   socket.join(roomCode);

   startRound(roomCode);

 });

 function startRound(roomCode){

   const room = rooms[roomCode];

   const word =
   words[Math.floor(
   Math.random()*words.length)];

   room.word = word;

   const drawerSocket =
   room.players[room.drawer];

   const guesserSocket =
   room.players[1-room.drawer];

   io.to(roomCode)
   .emit("gameStart");

   io.to(drawerSocket)
   .emit("yourWord",word);

   io.to(guesserSocket)
   .emit("guessMode");

 }

 socket.on("guess",(data)=>{

   const room =
   rooms[data.room];

   if(!room) return;

   if(data.word === room.word){

     room.scores[
     1-room.drawer
     ] += 10;

     room.scores[
     room.drawer
     ] += 5;

     io.to(data.room)
     .emit("correctGuess",
     room.scores);

   }

 });

 socket.on("draw",(data)=>{

   socket.to(data.room)
   .emit("draw",data);

 });

});

server.listen(
process.env.PORT || 3000
);

app.get("/health",(req,res)=>{
  res.status(200).send("OK");
});
