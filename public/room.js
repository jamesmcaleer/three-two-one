const ws = new WebSocket("ws://3.141.8.146:8082"); // make ws into wss later on

ws.addEventListener("open", () => {
    console.log("connection to room");
    const url = window.location.href
    const urlSplit = url.split('/').filter(part => part.trim() !== '');
    const roomCode = urlSplit[urlSplit.length - 1]
    const message = {
        type : "confirm room",
        code : roomCode,
    }
    console.log(roomCode)
    ws.send(JSON.stringify(message))
    

    // right now getting the ws url which does not have params, 
    // need 3000 url: see chatGPT
    // also beware of the multiple slashes 
})

ws.addEventListener("message", (event) =>{
    const data = JSON.parse(event.data)
    const type = data.type
    switch (type){
        case "game over":
            console.log("game over")
            location.replace(location.href);
            break
        
        case "continue":
            console.log("continue")
            location.replace(location.href);
            break

        case "room kick":
            window.location.href = "/";
            break

        case "ask url":
            const url = window.location.href
            const urlSplit = url.split('/').filter(part => part.trim() !== '');
            const roomCode = urlSplit[urlSplit.length - 1]
            const message = {
                type : "give url",
                code : roomCode,
            }
            console.log("ask url", roomCode)
            ws.send(JSON.stringify(message))
            break
    }
})

/*
window.addEventListener("beforeunload", (event) => {
    const url = window.location.href
    const urlSplit = url.split('/').filter(part => part.trim() !== '');
    const roomCode = urlSplit[urlSplit.length - 1]
    const message = {
        type : "close",
        code : roomCode,
    }
    console.log("beforeunload", roomCode)
    ws.send(JSON.stringify(message))
})
*/

function sendWord() {
    const inputElement = document.getElementById("textInput");
    const word = inputElement.value.toLowerCase().trim().split(" ").join("");
    const url = window.location.href
    const urlSplit = url.split('/').filter(part => part.trim() !== '');
    const roomCode = urlSplit[urlSplit.length - 1]
    if (word.trim !== "" && word.length >= 3 && word.length <= 15) {
        const message = {
            type : "word submit",
            word : word,
            code : roomCode
        }
        ws.send(JSON.stringify(message));
    }
    else {
        console.log("bad input")
    }

    

    // Check if the input is not empty before sending
    

    // Clear the input field after sending the message (optional)
    inputElement.value = "";
}
