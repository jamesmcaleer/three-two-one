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

        case "allow submit":
            const submitMessage = document.getElementById("errorMessage");
        
            submitMessage.textContent = "submitted";
            break

        case "deny submit":
            const denyMessage = document.getElementById("errorMessage");
        
            denyMessage.textContent = "already submitted";
            break

        case "update code":
            //document.getElementById("gamePinText").style.display = "none"
            //document.getElementById("room").style.display = "none"
            document.getElementById("inputArea").style.display = "block"
            document.getElementById("pastWordsLabel").style.display = "block"
            document.getElementById("allWords").style.display = "block"
            
            break

        case "update player":
            if (data.players[0] === 1){
                document.getElementById("playerOne").style.display = "inline-block"
            }
            else{
                document.getElementById("playerOne").style.display = "none"
            }
            if (data.players[1] === 1){
                document.getElementById("playerTwo").style.display = "inline-block"
            }
            else{
                document.getElementById("playerTwo").style.display = "none"
            }
            break

        case "game over":
            console.log("game over")
            var firstWord = document.createElement("label")
            var secondWord = document.createElement("label")
            firstWord.innerText = data.words[0]
            secondWord.innerText = data.words[1]
            firstWord.id = "entry"
            secondWord.id = "entry"

            var entry = document.createElement("div")
            entry.id = "entries"
            entry.appendChild(firstWord)
            entry.appendChild(secondWord)
            
            var allDiv = document.getElementById("allWords")
            //allDiv.appendChild(shownWords)

            allDiv.insertBefore(entry, allDiv.firstChild)

            const gMessage = document.getElementById("errorMessage");
        
            gMessage.textContent = "";

            break
        
        case "continue":
            console.log("continue")
            var firstWord = document.createElement("label")
            var secondWord = document.createElement("label")
            firstWord.innerText = data.words[0]
            secondWord.innerText = data.words[1]
            firstWord.id = "entry"
            secondWord.id = "entry"

            var entry = document.createElement("div")
            entry.id = "entries"
            entry.appendChild(firstWord)
            entry.appendChild(secondWord)
            
            var allDiv = document.getElementById("allWords")
            //allDiv.appendChild(shownWords)

            allDiv.insertBefore(entry, allDiv.firstChild)

            const cMessage = document.getElementById("errorMessage");
        
            cMessage.textContent = "";

            break

        case "room kick":
            window.location.href = "/";
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
    const inputElement = document.getElementById("wordInput");
    const word = inputElement.value.toUpperCase().trim().split(" ").join("");
    const url = window.location.href
    const urlSplit = url.split('/').filter(part => part.trim() !== '');
    const roomCode = urlSplit[urlSplit.length - 1]

    if (word !== "" && word.length >= 3 && word.length <= 12) {
        var allDiv = document.getElementById("allWords")
        var allEntries = allDiv.getElementsByTagName("div")
        

        var unique = true
        for (let i = 0; i < allEntries.length; i++){
            var entries = allEntries[i].getElementsByTagName("label")
            for (let j = 0; j < entries.length; j++){
                var entry = entries[j]
                if (word === entry.innerHTML){
                    unique = false
                }
            }
        }

        if (unique){
            const message = {
                type : "word submit",
                word : word,
                code : roomCode
            }
            ws.send(JSON.stringify(message));
        }
        else {
            const errorMessage = document.getElementById("errorMessage");
        
            errorMessage.textContent = "not an original word";
        }

        


    }
    else {
        console.log("bad input")
        const errorMessage = document.getElementById("errorMessage");
        
        errorMessage.textContent = "must be between 3 and 12 characters";
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

document.addEventListener("keyup", (e) => {
    if (e.code == "Enter") {
        sendWord();
    }
})
