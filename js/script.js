const input = document.querySelector(".input-field");
input.value ="";

var code = 'function positionIndex()'

var light = lowlight.highlight('js', code)

var html = hastUtilToHtml({type: 'root', children: light.value});
console.log(light.value);
document.write(html);

validateWord()
function validateWord() {
    var textSaker = code.split(" ");
    console.log(textSaker);
}

/**
 * @type {String[]}
 */
var typedText = [];

input.addEventListener('input', handleInput);

/**
 * Function to handle input event
 * @param {InputEvent} e
 */
function handleInput(e){
    /**
     * @type {String}
     */
    var inputStr = e.target.value;
    // Also check if was correct before going to next word
    if (inputStr.includes(" ")) {
        typedText.push(inputStr.slice(0, -1))
        if (compareInput()){
            console.log("yee");
            input.value="";
            document.querySelector(".text-field").innerHTML = typedText;
        }
        console.log(typedText)
    }



}


/**
 * @param {number} value
 */
function compareInput(){
    textSaker = code.split(" ");
    currentWordIndex = (typedText.length -1);
    textToCompare = typedText[currentWordIndex];
    

    console.log(textSaker, textToCompare)

    if (textSaker[currentWordIndex] == textToCompare) {
        return true;
    }else {
        typedText.pop(currentWordIndex);
        return;
    }

}

// använder skriver in ord, sedan trycker mellanslag då kollar den om ordet är stämmer och om det gör det gå rdne till nästa ord (suddar ut inputfällt)

