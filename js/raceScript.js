'use strict';

var code = '';
var snippets;

/**
 * @type {String[]}
 */
var typedWords = [];
var codeWords = code.split(' ');
var hlTypedText = document.createElement('span');

var currentLanguage;

var tmpInputValue = '';

function getRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
// function prossesCmd(){
//     this[fnName](params);
// }

function loadSnippets(lang) {
    var tmpSnippet = "def sak():\n    hejsan('fiskmås')";

    tmpSnippet = tmpSnippet.split('\n');

    currentLanguage = lang;

    setSnippet(tmpSnippet);
    // getSnippets(lang).then(data => {
    //     snippets = data;
    //     console.log(snippets);
    //     setSnippet();
    // });
}

function setSnippet(snippet) {
    var textField = document.querySelector('.text-field');

    if (true) {
        //(snippet.snippet != document.querySelector('.text-field').textContent) {
        snippet.forEach((e, i) => {
            console.log(e);
            var line = document.createElement('div');
            line.id = 'line' + i;
            var lineContent = document.createElement('span');
            lineContent.textContent = e;
            line.append(lineContent);
            textField.append(line);
        });

        code = document.getElementById('line0').textContent; //snippet.snippet;
        codeWords = code.split(' ');
        typedWords = [];
        hlTypedText.textContent = '';

        document.querySelector('.input-field').style.left =
            hlTypedText.offsetWidth + 35 + 'px';
    }
}

/**
 * Function to handle input event
 * @param {InputEvent} e
 */
function handleInput(e) {
    var inputStr = e.target.value;
    var typedLetters = typedWords + inputStr;
    if (inputStr.includes(' ') && typedLetters.length < code.length) {
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

function compareLetter(input) {
    //borde ha det som en inline funktion men använder den på flera ställen
    const currentLetter = codeWords[typedWords.length].slice(0, input.length);

    if (input === currentLetter) {
        return true;
    } else {
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
        var light = lowlight.highlight(currentLanguage, typedText + ' ');
        hlTypedText.innerHTML = hastUtilToHtml({
            type: 'root',
            children: light.value,
        });

        currentWord.textContent = '';
        tmpInputValue = '';
        document.querySelector('.input-field').style.left =
            hlTypedText.offsetWidth + 35 + 'px';
    } else {
        currentWord.classList.add(
            compareLetter(input) ? 'correctLetter' : 'incorrectLetter'
        );
        currentWord.textContent = input;
    }

    // if (typedText.length >= code.length) {
    //     setSnippet();
    // }

    var remainingText = document.createElement('span');
    remainingText.textContent = code.slice(
        typedText.length + input.length + (typedWords.length === 0 ? 0 : 1)
    );

    var currentLine = document.getElementById('line0');
    console.log(currentLine);
    currentLine.innerHTML = '';
    currentLine.appendChild(hlTypedText);
    currentLine.appendChild(currentWord);
    currentLine.appendChild(remainingText);
}

var inputElement = document.querySelector('.input-field');
inputElement.value = '';
inputElement.addEventListener('input', handleInput);
inputElement.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.target.value = e.target.value + 'as';
        handleInput(e);
    }
});

loadSnippets('python');
displayText(true); // gör om displayText för den är skit och helt jälva piss
hlTypedText.innerHTML = '';
