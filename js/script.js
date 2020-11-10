"use strict";

var code = "function displayText(completedWord, input)";

/**
 * @type {String[]}
 */
var typedWords = [];
var codeWords = code.split(" ");
var hlTypedText = document.createElement("span");

var incorectLetters = [];
var tmpInputValue = "";
var removedLetter = [];

function changeTheme(url){
    var themeTag = document.getElementById("syntax-hl");
    themeTag.setAttribute("href", url)
}

function listLangs() {
    var langs = ["python", "javascript", "c#"];

    const dropdownContent = document.querySelector(".dropdown-content");

    for (var i = 0; i < langs.length; i++) {
        var language = document.createElement("a");
        language.textContent = langs[i];
        dropdownContent.appendChild(language);
    }
}

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

    displayText(false, e.target.value);
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

function checkLetter(input) {
    if (input === codeWords[typedWords.length].slice(0, input.length)) {
        return "correctLetter";
    } else {
        return "incorrectLetter";
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
        hlTypedText.innerHTML = hastUtilToHtml({
            type: "root",
            children: light.value,
        });
        currentword.textContent = "";
        tmpInputValue = "";
    } else {
        currentword.classList.add(checkLetter(input));
        currentword.textContent = input;
    }

    var remainingText = document.createElement("span");
    remainingText.textContent = code.slice(typedText.length + input.length + (typedWords.length === 0 ? 0 : 1));

    var textField = document.querySelector(".text-field");

    textField.innerHTML = "";
    textField.appendChild(hlTypedText);
    textField.appendChild(currentword);
    textField.appendChild(remainingText);
}

var inputElement = document.querySelector(".input-field");
inputElement.value = "";
// inputElement.addEventListener('keydown', (e) => {
//   handleKeyDown(e)
// });
inputElement.addEventListener("input", (e) => {
    handleInput(e);
});

listLangs();
displayText(true); // gör om displayText för den är skit och helt jälva piss
