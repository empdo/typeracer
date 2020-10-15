"use strict";

var code =
"var hlTypedText = hastUtilToHtml({ type: 'root', children: light.value });";

/**
 * @type {String[]}
 */
var typedWords = [];
var codeWords = code.split(" ");
var hlTypedText = document.createElement("span");

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
      e.target.value = "";
      displayText(true);
    }
    console.log(typedWords);
  } else {
    displayText(false, e.target.value);
  }
}

/**
 * @param {number} value
 * @returns {boolean}
 */
function compareInput() {
  
  var currentWordIndex = typedWords.length - 1;
  var textToCompare = typedWords[currentWordIndex];

  if (codeWords[currentWordIndex] === textToCompare) {
    return true;
  } else {
    typedWords.pop(currentWordIndex);
    return false;
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
    var light = lowlight.highlight("js", typedText);
    hlTypedText.innerHTML = hastUtilToHtml({
      type: "root",
      children: light.value,
    });
  } else {
    currentword.classList.add("wrongLetter");
    currentword.textContent = input;
  }

  var remainingText = document.createElement("span");
  remainingText.textContent = code.slice(typedText.length + input.length + (typedWords.length === 0 ? 0 : 1));

  var textField = document.querySelector(".text-field");

  textField.innerHTML = "";
  textField.appendChild(hlTypedText);
  textField.appendChild(currentword);
  textField.appendChild(remainingText);
  
  console.log(typedText.length + input.length);
}

var inputElement = document.querySelector(".input-field");
inputElement.value = "";
inputElement.addEventListener("input", handleInput);

displayText(true);
