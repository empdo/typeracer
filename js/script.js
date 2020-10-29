"use strict";

var code =
"function displayText(completedWord, input)";

/**
 * @type {String[]}
 */
var typedWords = [];
var codeWords = code.split(" ");
var hlTypedText = document.createElement("span");

var incorectLetters = [];
var tmpInputValue = "";
var removedLetter = []

/**
 * Function to handle input event
 * @param {InputEvent} e
 */
function handleInput(e) {

  var inputStr = e.target.value;
  if (inputStr.includes(" ")) {
    typedWords.push(inputStr.slice(0, -1));
    if (compareInput()) {
      e.target.value = "";
      displayText(true);
    }
  }
  
  if (e.target.value.length < tmpInputValue.length) {
    removedLetter = (compareStr(e.target.value, tmpInputValue).slice(0,2));
    console.log(e.target.value, tmpInputValue)

    incorectLetters.forEach(e => {
      if(removedLetter == e) {
        incorectLetters.pop(e);
        console.log(incorectLetters);
      }
    }
    );

  }

  tmpInputValue = e.target.value;
  displayText(false, e.target.value);
}

function compareStr(str1, str2){
  var diffrence=[];
  var str2Split = str2.split('');
  str2Split.forEach((e, i) => {
    if (e != str1[i]){
      diffrence.push((e + i).toString());
    }
  });
  return(diffrence);
}

/**
 * @param {number} value
 * @returns {boolean}
 */
function compareInput() {
  
  var currentWordIndex = typedWords.length - 1;
  var textToCompare = typedWords[currentWordIndex];

  if (codeWords[currentWordIndex] == textToCompare) {
    return true;
  } else {
    typedWords.pop(currentWordIndex);
    return false;
  }
}

function checkLetter(letter, letterIndex) {
  if (letter === codeWords[typedWords.length][letterIndex] && incorectLetters.length === 0){
    return("correctLetter");
  } else {
    incorectLetters.push((letter + letterIndex).toString());
    return("incorrectLetter");
  }
}

/**
 * @param {boolean} completedWord
 * @param {String} input
 */
function displayText(completedWord, input) {
  var typedText = typedWords.join(" ");
  var currentword = document.createElement("span");

  if (!input) {
    input = "";
  }

  if (completedWord) {
    var light = lowlight.highlight("js", typedText + " ");
    hlTypedText.innerHTML = (hastUtilToHtml({
      type: "root",
      children: light.value,
    }));
    currentword.textContent = " ";
    tmpInputValue = "";
  } else {
    currentword.classList.add(checkLetter(input[input.length -1], input.length -1));
    currentword.textContent = input;
  }

  var remainingText = document.createElement("span");
  remainingText.textContent = code.slice(typedText.length + input.length + (typedWords.length === 0 ? 0 : 1));

  var textField = document.querySelector(".text-field");

  textField.innerHTML = "";
  textField.appendChild(hlTypedText);
  textField.appendChild(currentword);
  textField.appendChild(remainingText);
  
  //console.log(textField.innerHTML);
}

var inputElement = document.querySelector(".input-field");
inputElement.value = "";
// inputElement.addEventListener('keydown', (e) => {
//   handleKeyDown(e)
// });
inputElement.addEventListener("input", (e) => {
  handleInput(e)
});


displayText(true); // gör om displayText för den är skit och helt jälva piss
