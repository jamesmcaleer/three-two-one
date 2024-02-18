
function createGame(){
    //const ws = new WebSocket("ws://localhost:8082"); // make ws into wss later on
    const ws = new WebSocket("ws://3.141.8.146:8082")

    ws.addEventListener("open", () => {
        const create = {
            type : "create",
            //message : "create",
        }
        ws.send(JSON.stringify(create))
    })
    
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data)
        const type = data.type
        const message = data.message
        // console.log(data)
        if (type === "success room message"){
            const messageLabel = document.getElementById("errorMessage");
            const room = data.room
            
            //messageLabel.textContent = message;
    
            window.location.href = `/${room}`;
        }
        else if (type === "failure room message"){
            const messageLabel = document.getElementById("errorMessage");
            
            messageLabel.textContent = message;
        }
        ws.close()
    })
}

// create a leave game function after you make the dynamic html pages because the function
// will need the room code to find which user to remove from the room

function joinGame(){
    //const ws = new WebSocket("ws://localhost:8082"); // make ws into wss later on
    const ws = new WebSocket("ws://3.141.8.146:8082")

    ws.addEventListener("open", () => {
        const inputElement = document.getElementById("joinCode");
        const joinCode = inputElement.value.toUpperCase().trim().split(" ").join("");
        const join = {
            type : "join",
            code : joinCode,
        }

        //should only be able to join if there is an open spot
        ws.send(JSON.stringify(join))

        inputElement.value = "";
    })
    
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data)
        const type = data.type
        const message = data.message
        // console.log(data)
        if (type === "success room message"){
            const messageLabel = document.getElementById("errorMessage");
            const room = data.room
            
            //messageLabel.textContent = message;
    
            window.location.href = `/${room}`;
        }
        else if (type === "failure room message"){
            const messageLabel = document.getElementById("errorMessage");
            
            messageLabel.textContent = message;
        }

        ws.close()
    })

}

function showRules() {
    document.getElementById("rulesOverlay").style.display = "flex";

}

function hideRules() {
    document.getElementById("rulesOverlay").style.display = "none";

}

document.addEventListener("keyup", (e) => {
    if (e.code == "Enter") {
        joinGame();
    }
})






