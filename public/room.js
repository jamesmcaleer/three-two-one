//const ws = new WebSocket("ws://localhost:8082"); // make ws into wss later on
const ws = new WebSocket("ws://3.141.8.146:8082")

ws.addEventListener("open", () => {
    console.log("connection to room");
    const url = window.location.href
    const urlSplit = url.split('/').filter(part => part.trim() !== '');
    const roomCode = urlSplit[urlSplit.length - 1]
    const message = {
        type : "verify user",
        code : roomCode,
    }
    console.log(roomCode)
    ws.send(JSON.stringify(message))
    
})

ws.addEventListener("message", (event) =>{
    const data = JSON.parse(event.data)
    const type = data.type
    switch (type){
        case "update player":
            const players = JSON.parse(data.players)
            if (players[0] !== 0){
                document.getElementById("playerOne").innerHTML = "Player 1"
            }
            else{
                document.getElementById("playerOne").innerHTML = ""
            }
            if (players[1] !== 0){
                document.getElementById("playerTwo").innerHTML = "Player 2"
            }
            else{
                document.getElementById("playerTwo").innerHTML = ""
            }
            break

        case "game over":
            console.log("game over")
            location.replace(location.href);
            break
        
        case "continue":
            console.log("continue")
            var submittedWords = document.createElement("ul")
            submittedWords.innerText = data.words.join(" ")
            
            const allDiv = document.getElementById("allWords")
            //allDiv.appendChild(shownWords)
            allDiv.insertBefore(submittedWords, allDiv.firstChild)

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


    inputElement.value = "";
}

function copyLink() {
    var textarea = document.createElement("textarea");
    var copyMessage = document.getElementById("copyMessage")
    // Set its value to the text you want to copy
    textarea.value = window.location.href;

    // Make it non-editable to avoid focus and move it out of the viewport
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";

    // Append the textarea element to the HTML document
    document.body.appendChild(textarea);

    // Select the text in the textarea
    textarea.select();

    // Execute the copy command
    document.execCommand('copy');

    // Remove the textarea from the DOM
    document.body.removeChild(textarea);

    console.log("Text copied to clipboard!");
    copyMessage.innerHTML = "[link copied]"

}
