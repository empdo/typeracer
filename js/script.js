'use strict';

var code = 'function displayText(completedWord, input)';
var snippets;

/**
 * @type {String[]}
 */
var typedWords = [];
var codeWords = code.split(' ');
var hlTypedText = document.createElement('span');

var incorectLetters = [];
var tmpInputValue = '';
var removedLetter = [];

function changeTheme(url) {
    var themeTag = document.getElementById('syntax-hl');
    themeTag.setAttribute('href', url);
}

function loadSnippets(lang) {
    getSnippets(lang).then(data => {
        snippets = data;
        console.log(snippets);
    });
}

function listLangs() {
    var langs = getLanguages();

    langs.then(data => {
        const dropdownContent = document.querySelector('.dropdown-content');

        for (var i = 0; i < data.length; i++) {
            var language = document.createElement('a');
            language.textContent = data[i];
            language.onclick = e => {
                loadSnippets(data[i]);
            };
            dropdownContent.appendChild(language);
        }
    });
}

/**
 * Function to handle input event
 * @param {InputEvent} e
 */
function handleInput(e) {
    var inputStr = e.target.value;
    if (inputStr.includes(' ')) {
        typedWords.push(inputStr.slice(0, -1));
        if (compareInput()) {
            e.target.value = '';
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

/**
 * @param {boolean} completedWord
 * @param {String} input
 */
function displayText(completedWord, input) {
    var typedText = typedWords.join(' ');
    var currentWord = document.createElement('span');

    input = input ? input : '';

    if (completedWord) {
        var light = lowlight.highlight('js', typedText + " ");
        hlTypedText.innerHTML = hastUtilToHtml({
            type: 'root',
            children: light.value,
        });
        
        currentWord.textContent = '';
        tmpInputValue = '';
        console.log(typedText, typedText.length)
        document.querySelector(".input-field-container").style.left = hlTypedText.offsetWidth + "px";

    } else {
        const currentLetter = codeWords[typedWords.length].slice(
            0,
            input.length
        );
        currentWord.classList.add(
            input === currentLetter ? 'correctLetter' : 'incorrectLetter'
        );
        currentWord.textContent = input;
    }

    var remainingText = document.createElement('span');
    remainingText.textContent = code.slice(
        typedText.length + input.length + (typedWords.length === 0 ? 0 : 1)
    );

    var textField = document.querySelector('.text-field');

    textField.innerHTML = '';
    textField.appendChild(hlTypedText);
    textField.appendChild(currentWord);
    textField.appendChild(remainingText);
}

var inputElement = document.querySelector('.input-field');
inputElement.value = '';
// inputElement.addEventListener('keydown', (e) => {
//   handleKeyDown(e)
// });
inputElement.addEventListener('input', e => {
    handleInput(e);
});

listLangs();
displayText(true); // gör om displayText för den är skit och helt jälva piss
hlTypedText.innerHTML = "";
