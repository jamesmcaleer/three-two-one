const express = require('express');
const path = require('path');
const { PassThrough } = require('stream');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.set('view engine', 'ejs')

const server = app.listen(3000, () => {
  console.log(`Listening on ${server.address().port}`);
});

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port:8082 });

const rooms = [];

app.get('/:roomCode', (req, res) => {
    const roomCode = req.params.roomCode
    const message = {
        type : "confirm room",
        code : roomCode,
    }

    rooms.forEach((room) => {
        if (room.code === roomCode){
            res.render('index', {room})  //{ data : {roomID : roomID}}
        }
    })
    
})

/*
var users = [0,0]
var words = ["", ""]
*/



wss.on("connection", (ws, req) => {
    console.log("joining page")
    
    /*
    if (users[0] == 0){
        ws.id = 1
        users[0] = ws
    }
    else if (users[1] == 0){
        ws.id = 2
        users[1] = ws
    }
    else{
        ws.close()
        console.log("extra client join blocked")
        return
    }

    const id = {
        message : ws.id,
        type : "id",
    }
    ws.send(JSON.stringify(id))

    console.log(`New client ${ws.id} connected!`)

    console.log("users on connection: ")
    users.forEach(user =>{
        console.log(user.id)
    })
    */


    // show room code until both players join
    // then keep playing game until they win or player leaves
    ws.on("message", (event, req) =>{
        const data = JSON.parse(event)
        const type = data.type
        switch (type) {
            case "word submit":
                var roomCode = data.code
                var word = data.word
                var index = -1
                for (let i = 0; i < rooms.length; i++){
                    if (rooms[i].code === roomCode){
                        index = i
                        break
                    }
                }

                var room = rooms[index]

                if (room.users[0] === ws){
                    room.words[room.words.length - 1][0] = word
                }
                else if (room.users[1] === ws){
                    room.words[room.words.length - 1][1] = word
                }
                console.log(`submitted ${word}`)

                var empty = false
                room.words[room.words.length - 1].forEach(word =>{
                    if (word === ""){
                        empty = true
                    }
                }) 

                if (!empty){
                    if (room.words[room.words.length - 1][0] === room.words[room.words.length - 1][1]){
                        const message = {
                            type : "game over"
                        }
                        room.users.forEach(user => {
                            user.send(JSON.stringify(message))
                        })
                        console.log("game over")
                    }
                    else{
                        const message = {
                            type : "continue",
                            words : room.words[room.words.length - 1]
                        }
                        room.users.forEach(user => {
                            user.send(JSON.stringify(message))
                        })
                        console.log("continue")
                        room.words.push(["", ""])
                    }
                    
                }


                break

            case "close":
                // unreachable
                console.log("unreachable, error")
                var roomCode = data.code
                var index = -1
                for (let i = 0; i < rooms.length; i++){
                    if (rooms[i].code === roomCode){
                        index = i
                        break
                    }
                }
                var room = rooms[index]
                if (room.users[0] === ws){
                    room.users[0] = 0
                }
                else if (room.users[1] === ws){
                    room.users[1] = 0
                }
                console.log(room)

                if ((room.users[0] === 0) && room.users[1] === 0){
                    console.log(`deleting room ${room.code}`)
                    rooms.pop(index)
                }

                break
            case "confirm room":
                var roomCode = data.code
                var index = -1
                for (let i = 0; i < rooms.length; i++){
                    if (rooms[i].code === roomCode){
                        index = i
                        break
                    }
                }
                var room = rooms[index]
                console.log(`confirming room ${roomCode}`)
                if ((room.users[0] === 1) || (room.users[0] === 0)) {
                    room.users[0] = ws
                }
                else if ((room.users[1] === 1) || (room.users[1] === 0)){
                    room.users[1] = ws
                }
                else{
                    console.log("need to exit")
                    const kick = {
                        type : "room kick"
                    }
                    ws.send(JSON.stringify(kick))
                    ws.close()
                }
                
                break

            case "create":
                var roomCode = wss.generateRoomCode()
            
                let codeExists = false
                for (let i = 0; i < rooms.length; i++){
                    if (rooms[i].code === roomCode){
                        codeExists = true
                        break
                    }
                }
                
                if (codeExists) {
                    roomCode = wss.generateRoomCode()
                }
                    
                const newRoom = {
                    code : roomCode,
                    users : [1, 0],
                    words : [["", ""]],
                }

                

                
                // should also put the client into the rooms page
                rooms.push(newRoom)
                console.log(`created room ${newRoom.code}`)
                // send message back to client
                const success = {
                    type : "success room message",
                    message : `room code ${newRoom.code} successfully created!`,
                    room : newRoom.code
                }
                ws.send(JSON.stringify(success))

                break
            case "join":
                var roomCode = data.code

                var index = -1
                for (let i = 0; i < rooms.length; i++){
                    if (rooms[i].code === roomCode){
                        index = i
                        break
                    }
                }
                if (index === -1){
                    // send message to client
                    const failure = {
                        type : "failure room message",
                        message : "unknown game pin, please try again"
                    }
                    ws.send(JSON.stringify(failure))
                }
                else if ((rooms[index].users[0] !== 0) && (rooms[index].users[1] !== 0)){
                    const failure = {
                        type : "failure room message",
                        message : "room is full"
                    }
                    ws.send(JSON.stringify(failure))
                }
                else{
                    const room = rooms[index]
                    
                    // should also put the client into the rooms page
                    // to do this i need an express server and have to use hogan middleware to dynamically generate an html page
                    room.users[1] = 1

                    const success = {
                        type : "success room message",
                        message : `room code ${room.code} successfully joined!`,
                        room : room.code
                    }
                    ws.send(JSON.stringify(success))
                    
                }
                break
            
            
        }
        /* 
        console.log(`Client ${ws.id} sent us: ${data}`)
        words[ws.id - 1] = data.toString()
        console.log(words[0])
        console.log(words[1])
        if (!(words.includes(""))){
            console.log("checking")
            const result = {
                message: wss.checkWords(words),
                type: "result",
            }
            users.forEach((client) => client.send(JSON.stringify(result)))
            words = ["", ""]

        }
        */
    })

    ws.on("close", () =>{
        console.log("leaving page")
        
        for (let i = 0; i < rooms.length; i++){
            let room = rooms[i]
            if (room.users[0] === ws){
                room.users[0] = 0
                
                if (room.users[0] === 0 && room.users[1] === 0){
                    console.log(`deleting room ${room.code}, index ${i}`)
                    wss.delayDelete(i)
                    
                }
                
            }
            else if (room.users[1] === ws){
                room.users[1] = 0
                if (room.users[0] === 0 && room.users[1] === 0){
                    console.log(`deleting room ${room.code}`)
                    wss.delayDelete(i)
                }
            }
        }

        
        // add room leaving

        /*
        console.log(`Client ${ws.id} has disconnected`)
        users[ws.id - 1] = 0
        words[ws.id - 1] = ""

        console.log("users on disconnect: ")
        users.forEach(user =>{
            console.log(user.id)
        })
        */
       
    })


})

wss.delayDelete = function (i) {
    setTimeout(() => {
        rooms.splice(i, 1)
    }, 5000);
}

wss.checkWords = function (words) {
    if (words[0] === words[1]){
        console.log("same word!")
        return "same word!";
    }
    else {
        console.log("different word")
        return "different word";
    }
}

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.generateRoomCode = function () {
    let code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++){
      code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(code)
    return code;
}



