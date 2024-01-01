const ws = new WebSocket("ws://localhost:8082"); // make ws into wss later on 

ws.addEventListener("open", () => {
    console.log("connection to main");

    //ws.send("I have joined")
})

ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data)
    const type = data.type
    const message = data.message
    // console.log(data)
    if (type === "success room message"){
        const messageLabel = document.getElementById("roomMessage");
        const room = data.room
        
        messageLabel.textContent = message;

        window.location.href = `/${room}`;
    }
    else if (type === "failure room message"){
        const messageLabel = document.getElementById("roomMessage");
        
        messageLabel.textContent = message;
    }
})

function createGame(){
    const create = {
        type : "create",
        //message : "create",
    }
    ws.send(JSON.stringify(create))
}

// create a leave game function after you make the dynamic html pages because the function
// will need the room code to find which user to remove from the room

function joinGame(){
    const inputElement = document.getElementById("joinCode");
    const joinCode = inputElement.value.toUpperCase().trim().split(" ").join("");
    const join = {
        type : "join",
        code : joinCode,
    }

    //should only be able to join if there is an open spot
    ws.send(JSON.stringify(join))

    inputElement.value = "";
}

function showRules() {
    window.location.href = `/rules.html`;

}




