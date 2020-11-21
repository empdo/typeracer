'use strict';

var code = "def sak():\n    hejsan('fiskmås')"; //document.querySelector('.text-field').textContent;
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
    tmpSnippet = tmpSnippet.join(''); //borde göra olika variablar ist för att ba gö allt på samma
    tmpSnippet = tmpSnippet.split(' ');

    tmpSnippet = tmpSnippet.filter(e => e);

    console.log(tmpSnippet);

    // getSnippets(lang).then(data => {
    //     snippets = data;
    //     console.log(snippets);
    //     setSnippet();
    // });
    codeWords = tmpSnippet;
    currentLanguage = lang;
}

function setSnippet() {
    var snippet = "def sak():\n    hejsan('fiskmås')"; // getRandom(snippets);
    console.log(snippet.snippet);

    if (true) {
        //(snippet.snippet != document.querySelector('.text-field').textContent) {
        document.querySelector('.text-field').textContent = snippet; //snippet.snippet;
        code = snippet; //snippet.snippet;
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

    console.log(codeWords[currentWordIndex], textToCompare);

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
        const currentLetter = codeWords[typedWords.length].slice(
            0,
            input.length
        );
        currentWord.classList.add(
            input === currentLetter ? 'correctLetter' : 'incorrectLetter'
        );
        currentWord.textContent = input;
    }

    if (typedText.length >= code.length) {
        setSnippet();
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
inputElement.addEventListener('input', e => {
    handleInput(e);
});

loadSnippets('javascript');
displayText(true); // gör om displayText för den är skit och helt jälva piss
hlTypedText.innerHTML = '';
