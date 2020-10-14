const input = document.querySelector(".input-field");
input.value = "";

var code = "var hlTypedText = hastUtilToHtml({ type: 'root', children: light.value });";

function validateWord() {
  var textSaker = code.split(" ");
  console.log(textSaker);
}

/**
 * @type {String[]}
 */
var typedWords = [];

input.addEventListener("input", handleInput);

/**
 * Function to handle input event
 * @param {InputEvent} e
 */
function handleInput(e) {
  /**
   * @type {String}
   */
  var inputStr = e.target.value;
  // Also check if was correct before going to next word
  if (inputStr.includes(" ")) {
    typedWords.push(inputStr.slice(0, -1));
    if (compareInput()) {
      input.value = "";
      displayText();
    }
    console.log(typedWords);
  }
}

/**
 * @param {number} value
 */
function compareInput() {
  textSaker = code.split(" ");
  currentWordIndex = typedWords.length - 1;
  textToCompare = typedWords[currentWordIndex];

  console.log(textSaker, textToCompare);

  if (textSaker[currentWordIndex] == textToCompare) {
    return true;
  } else {
    typedWords.pop(currentWordIndex);
    return;
  }
}

function displayText() {
  //göra en till funktion för att sätta ut det ordet man är på, den funktionen kan då sköta att varje bokstav så att man inte anävnder lowlight flör varje bpokstav
  var typedText = typedWords.join(" ");

  var light = lowlight.highlight("js", typedText);
  console.log(light.value);
  var hlTypedText = hastUtilToHtml({ type: "root", children: light.value });

  var remainingText = code.slice(typedText.length); 

  document.querySelector(".text-field").innerHTML = hlTypedText + remainingText;
}


displayText();
validateWord();
