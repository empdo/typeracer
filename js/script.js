var hlTypedText;

const input = document.querySelector(".input-field");
input.value = "";

var code =
  "var hlTypedText = hastUtilToHtml({ type: 'root', children: light.value });";

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
  if (inputStr.includes(" ")) {
    typedWords.push(inputStr.slice(0, -1));
    if (compareInput()) {
      input.value = "";
      displayText(true);
    }
    console.log(typedWords);
  } else {
    displayText(false, input.value);
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

function displayText(completedWord, input) {
  var typedText = typedWords.join(" ");
  var currentword;

  if (input == null) {
    input = "";
  }

  if (completedWord) {
    var light = lowlight.highlight("js", typedText);
    hlTypedText = hastUtilToHtml({ type: "root", children: light.value });
    currentword = "";
  } else {
    currentword = document.createElement("span");
    currentword.classList.add("wrongLetter");
    currentword.textContent = input;
  }

  var remainingText = code.slice(typedText.length + input.length);
  var textField = document.querySelector(".text-field");
  textField.innerHTML = hlTypedText + remainingText;
  textField.insertBefore(currentword, textField.lastChild);
  console.log(typedText.length + input.length);
}

displayText(true);
validateWord();
