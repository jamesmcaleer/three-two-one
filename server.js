const express = require('express');
const path = require('path');
const { PassThrough } = require('stream');
const app = express();

const TIMEOUT = 120000

// FOR SUNDAY ** implement find game feature and launch site

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.set('view engine', 'ejs')

const server = app.listen(3000, () => {
  console.log(`Listening on ${server.address().port}`);
});

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port:8082 });

const rooms = [];

app.get('/rules', (req, res) => {
    console.log("rules")
    res.sendFile(path.join(__dirname, '/public/rules.html'))
})

app.get('/:roomCode', (req, res) => {
    const roomCode = req.params.roomCode
    var message = {
        type : "confirm room",
        code : roomCode,
    }

    var found = false
    rooms.forEach((room) => {
        if (room.code === roomCode){
            found = true
            res.render('index', {room})  //{ data : {roomID : roomID}}
        }
    })
    if (!found){
        res.sendFile(path.join(__dirname, '/public/index.html'))
    }
    
})




wss.on("connection", (ws, req) => {
    console.log("joining page")

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

                console.log(room.code)

                clearTimeout(room.timeoutID)
                
                var timeoutID = setTimeout(() => {
                
                    for (let i = 0; i < rooms.length; i++){
                        if (rooms[i].code === room.code){
                            // send timeout message
                            console.log(`deleting room ${room.code}, index ${i}, timeout in create`)
                            // for users in 
                            rooms[i].users.forEach( user => {
                                if (user !== 0 && user !== 1 && user !== undefined){
                                    var message = {
                                        type : "timeout"
                                    }
                                    user.send(JSON.stringify(message))
                                }
                                
                            })
                                
                            rooms.splice(i, 1)

                            break
                        }
                    }

                }, TIMEOUT)

                room.timeoutID = timeoutID


                if (room.started === false) {
                    room.started = true
                    console.log("game started")

                }

                if (room.users[0] === ws){
                    var ind = 0
                } 
                else if (room.users[1] === ws){
                    var ind = 1
                }

                if (room.privWords[room.privWords.length - 1][ind] === ""){
                    room.privWords[room.privWords.length - 1][ind] = word
                    var message = {
                        type : "allow submit"
                    }
                    ws.send(JSON.stringify(message))

                    var message = {
                        type : "player color",
                        player : ind
                    }

                    room.users.forEach(user => {
                        user.send(JSON.stringify(message))
                    })

                    var empty = false
                    room.privWords[room.privWords.length - 1].forEach(word =>{
                        if (word === ""){
                            empty = true
                        }
                    }) 

                    if (!empty){
                        let wordOne = room.privWords[room.privWords.length - 1][0];
                        let wordTwo = room.privWords[room.privWords.length - 1][1];
                        let temporary = room.privWords[room.privWords.length - 1][0];
                        let same = true

                        if (wordOne.length > wordTwo.length){
                            wordOne = wordTwo;
                            wordTwo = temporary;
                        }

                        for (let i = 0; i < wordOne.length; i++){
                            if (wordOne[i] !== wordTwo[i]){
                                same = false
                                break
                            }
                        }

                        if (same){
                            var message = {
                                type : "game over",
                                words : room.privWords[room.privWords.length - 1]
                            }
                            room.users.forEach(user => {
                                user.send(JSON.stringify(message))
                            })
                            console.log("game over")
                        }
                        else{
                            var message = {
                                type : "continue",
                                words : room.privWords[room.privWords.length - 1]
                            }
                            room.users.forEach(user => {
                                user.send(JSON.stringify(message))
                            })
                            console.log("continue")
                            room.privWords.push(["", ""])
                        }
                        
                        // creates a shallow copy
                        let temp = JSON.stringify(room.privWords)
                        room.pubWords = JSON.parse(temp) 
                        


                        //if ()
                        
                    }
                    console.log(room.pubWords)
                    console.log(`submitted ${word}`)
                    
                }
                else {
                    var message = {
                        type : "deny submit"
                    }
                    ws.send(JSON.stringify(message))
                }
                

                break

            case "verify user":
                var roomCode = data.code
                var index = -1
                for (let i = 0; i < rooms.length; i++){
                    if (rooms[i].code === roomCode){
                        index = i
                        break
                    }
                }
                var room = rooms[index]
                console.log(`verifying join to ${roomCode}`)

                var found = false
                rooms.forEach(cRoom => {
                    if (cRoom.code === roomCode){
                        found = true
                    }
                })
                if (!found){
                    console.log("invalid room, verify")
                    const kick = {
                        type : "room kick"
                    }
                    ws.send(JSON.stringify(kick))
                    ws.close()
                    break
                }

                //console.log(room.users)
                if ((room.users[0] === 1) || (room.users[0] === 0)) { // if the first slot is joinable
                    room.users[0] = ws

                    clearTimeout(room.timeoutID)

                    var timeoutID = setTimeout(() => {

                        for (let i = 0; i < rooms.length; i++){
                            if (rooms[i].code === room.code){
                                // send timeout message
                                console.log(`deleting room ${room.code}, index ${i}, timeout in verify`)
                                // for users in 
                                rooms[i].users.forEach( user => {
                                    if (user !== 0 && user !== 1 && user !== undefined){
                                        var message = {
                                            type : "timeout"
                                        }
                                        user.send(JSON.stringify(message))
                                    }
                                    
                                })
                                    
                                rooms.splice(i, 1)
    
                                break
                            }
                        }
    
                    }, TIMEOUT)
    
                    room.timeoutID = timeoutID

                    if (room.users[1] !== 0 && room.users[1] !== 1 && room.users[1] !== undefined){ // if other slot full

                        const updateCode = {
                            type : "update code"
                        }

                        room.users.forEach(user => {
                            if (user !== 0 && user !== 1 && user !== undefined){
                                user.send(JSON.stringify(updateCode))
                            }
                            
                        })

                        console.log("removing join code")

                    }

                
                    var players = [0, 0]

                    for (let i = 0; i < room.users.length; i++){
                        if (room.users[i] !== 0 && room.users[i] !== 1 && room.users[i] !== undefined){
                            players[i] = 1
                        }
                    }

                    const updatePlayer = {
                        type : "update player",
                        players : players
                    }
                    room.users.forEach(user => {
                        if (user !== 0 && user !== 1 && user !== undefined){
                            user.send(JSON.stringify(updatePlayer))
                        }
                        
                    })
                }
                else if ((room.users[1] === 1) || (room.users[1] === 0)){ // if the second slot is joinable
                    room.users[1] = ws

                    clearTimeout(room.timeoutID)

                    var timeoutID = setTimeout(() => {

                        for (let i = 0; i < rooms.length; i++){
                            if (rooms[i].code === room.code){
                                // send timeout message
                                console.log(`deleting room ${room.code}, index ${i}, timeout in verify`)
                                // for users in 
                                rooms[i].users.forEach( user => {
                                    if (user !== 0 && user !== 1 && user !== undefined){
                                        var message = {
                                            type : "timeout"
                                        }
                                        user.send(JSON.stringify(message))
                                    }
                                    
                                })
                                    
                                rooms.splice(i, 1)
    
                                break
                            }
                        }
    
                    },TIMEOUT)
    
                    room.timeoutID = timeoutID

                    if (room.users[0] !== 0 && room.users[0] !== 1 && room.users[0] !== undefined){ // if other slot if full

                        const updateCode = {
                            type : "update code"
                        }

                        room.users.forEach(user => {
                            if (user !== 0 && user !== 1 && user !== undefined){
                                user.send(JSON.stringify(updateCode))
                                
                            }
                            
                        })
                        console.log("removing join code")

                    }  

                    var players = [0, 0]

                    for (let i = 0; i < room.users.length; i++){
                        if (room.users[i] !== 0 && room.users[i] !== 1 && room.users[i] !== undefined){
                            players[i] = 1
                        }
                    }

                    const updatePlayer = {
                        type : "update player",
                        players : players
                    }
                    room.users.forEach(user => {
                        if (user !== 0 && user !== 1 && user !== undefined){
                            user.send(JSON.stringify(updatePlayer))
                        }
                        
                    })
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
                    started : false,
                    users : [1, 0],
                    pubWords : [["", ""]],
                    privWords : [["", ""]],
                }
                
                // should also put the client into the rooms page
                rooms.push(newRoom)



                console.log(`created room ${newRoom.code}`)
                //console.log(rooms)
                


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
                        message : "unknown game pin"
                    }
                    ws.send(JSON.stringify(failure))
                }
                else if ((rooms[index].users[0] !== 0) && (rooms[index].users[1] !== 0)){
                    const failure = {
                        type : "failure room message",
                        message : "game is full"
                    }
                    ws.send(JSON.stringify(failure))
                }
                else{
                    const room = rooms[index]
                    
                    // staging for join ex. making the user 1 so it can be converted to ws on enter
                    if (room.users[0] === 0 || room.users[0] === 1) {
                        room.users[0] = 1
                    }
                    else if (room.users[1] === 0 || room.users[1] === 1) {
                        room.users[1] = 1
                    }

                    const success = {
                        type : "success room message",
                        message : `room code ${room.code} successfully joined!`,
                        room : room.code
                    }
                    ws.send(JSON.stringify(success))
                    
                }
                break
            
            
        }

    })

    ws.on("close", () =>{
        console.log("leaving page")
        var found = false
        for (var i = 0; i < rooms.length; i++){

            var room = rooms[i]
            if (room.users[0] === ws){
                room.users[0] = 0
                found = true
                break
                
            }
            else if (room.users[1] === ws){
                room.users[1] = 0
                found = true
                break
            }
        }
        if (found){
            console.log('found', i)

            var players = [0, 0]
            for (let j = 0; j < room.users.length; j++){
                if (room.users[j] !== 0 && room.users[j] !== 1 && room.users[j] !== undefined){
                    players[j] = 1
                }
            }

            const updatePlayer = {
                type : "update player",
                players : players
            }
            room.users.forEach(user => {
                if (user !== 0 && user !== 1){
                    user.send(JSON.stringify(updatePlayer))
                }
                
            })

            if (room.started){
                setTimeout(() => {
                    if (room.users[0] === 0 || room.users[0] === undefined || room.users[1] === 0 || room.users[1] === undefined){
                        // add message for other user
                        
                        rooms.forEach( curRoom =>{
                            if (curRoom.code === room.code){
                                console.log(`deleting room ${room.code}, index ${i}, started`)
                                rooms.splice(i, 1)
                            }
                        })
                    }
                        
                
                }, 60000)
            }
            else if (room.users[0] === 0 && room.users[1] === 0){
                setTimeout(() => {
                    rooms.forEach( curRoom =>{
                        if (curRoom.code === room.code){
                            if (room.users[0] === 0 && room.users[1] === 0){
                                console.log(`deleting room ${room.code}, index ${i}, room empty`)
                                rooms.splice(i, 1)
                            }
                        }
                    })
                    
                }, 5000);
            }
        }
    })


})


// game only going to server that no longer exists, happens after the first word submits
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
    //console.log(code)
    return code;
}



