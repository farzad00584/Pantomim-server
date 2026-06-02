const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    origin:"*"
  }
});

const rooms = {};

app.get("/",(req,res)=>{
  res.send("Server Online");
});

io.on("connection",(socket)=>{

  console.log("Connected:",socket.id);

  socket.on("createRoom",()=>{

    const roomCode =
      Math.floor(1000 + Math.random()*9000).toString();

    rooms[roomCode] = {
      players:[socket.id]
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

    rooms[roomCode].players.push(socket.id);

    socket.join(roomCode);

    io.to(roomCode).emit("gameStart");

  });

});

server.listen(process.env.PORT || 3000);
