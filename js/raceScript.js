'use strict';

var code = '';
var snippets;
var currentLineIndex = 0;
var nextLineIndex = 0;

/**
 * @type {String[]}
 */
var typedWords = [];
var codeWords = code.split(' ');

var currentLanguage;

var tmpInputValue = '';

function getRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}
// function prossesCmd(){
//     this[fnName](params);
// }

function loadSnippets(lang) {
    var tmpSnippet = "def sak():\n    print('k')\n    print('k')";

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
    var childrenToRemove = []; //tar man bort dom dirket kommer en skippas
    textField.childNodes.forEach((e, i) => {
        childrenToRemove.push(e);
    })
    childrenToRemove.forEach((e) => {
        e.parentNode.removeChild(e);
    });

    document.querySelector('.input-field').style.left =
    0 + 'px';
    document.querySelector('.input-field').style.top =
    0 + 'px';

    currentLineIndex = 0;

    if (true) {
        //(snippet.snippet != document.querySelector('.text-field').textContent) {
        snippet.forEach((e, i) => {
            console.log(e);
            var line = document.createElement('div');
            line.id = 'line' + i;

            var lineContent = document.createElement('span');
            for (var j = 0; j < e.length; j++) {
                if (e[j] !== ' ') {
                    lineContent.textContent = e.slice(j);
                    lineContent.id = 'lineContent' + i;

                    var indenting = document.createElement('span');
                    indenting.textContent = ' '.repeat(j);
                    indenting.id = 'indent' + i;
                    break;
                }
            }

            var lineHlTypedText = document.createElement('span');
            lineHlTypedText.id = 'hlTypedText-line' + i;

            [indenting, lineContent, lineHlTypedText].forEach(e =>
                line.appendChild(e)
            );

            textField.append(line);
        });

        resizeSidebar(snippet.length);

        var hlTypedText = document.getElementById(
            'hlTypedText-line' + currentLineIndex
        );

        code = document.getElementById('lineContent0').textContent;
        codeWords = code.split(' ');
        typedWords = [];
        hlTypedText.textContent = '';


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

    const isCorrect = codeWords[currentWordIndex] == textToCompare;
    if (!isCorrect) {
        typedWords.pop(currentWordIndex);
    }
    return isCorrect;
}

function compareLetter(input) {
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
    var hlTypedText = document.getElementById(
        'hlTypedText-line' + currentLineIndex
    );

    input = input ? input : '';

    if (completedWord) {
        var light = lowlight.highlight(
            currentLanguage,
            typedText + (typedText ? ' ' : '')
        );
        hlTypedText.innerHTML = hastUtilToHtml({
            type: 'root',
            children: light.value,
        });

        currentWord.textContent = '';
        tmpInputValue = '';

        hlTypedText = document.getElementById(
            'hlTypedText-line' + nextLineIndex
        );
        var objToOffset =
            hlTypedText.offsetWidth > 0 //TODO: GÖR EN EGEN JÄVLA FUNktion för der så man slipper skrica om hltypedtext
                ? hlTypedText
                : document.getElementById('indent' + nextLineIndex);
        document.querySelector('.input-field').style.left =
            objToOffset.offsetWidth + 'px';
        document.querySelector('.input-field').style.top =
            nextLineIndex * 15.4 + 'px';

        hlTypedText = document.getElementById(
            'hlTypedText-line' + currentLineIndex
        );
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

    var currentLine = document.getElementById('lineContent' + currentLineIndex);
    currentLine.innerHTML = '';
    [hlTypedText, currentWord, remainingText].forEach(e => {
        currentLine.appendChild(e);
    });
}

var inputElement = document.querySelector('.input-field');
inputElement.value = '';
inputElement.addEventListener('input', handleInput);
inputElement.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (!document.getElementById('lineContent' + (currentLineIndex + 1))) {
            e.target.value = "";
            loadSnippets();
        } else {
            var lengthOfTypedWords = 0;
            typedWords.forEach(e => {
                lengthOfTypedWords = lengthOfTypedWords + e.length;
            });

            var stripedCode = code.split(' ');
            stripedCode = stripedCode.join('');
            if (
                lengthOfTypedWords + e.target.value.length ===
                stripedCode.length
            ) {
                typedWords.push(e.target.value);
                if (compareInput()) {
                    nextLineIndex += 1;
                    e.target.value = '';
                    displayText(true);

                    if (
                        document.getElementById(
                            'lineContent' + (currentLineIndex + 1)
                        )
                    ) {
                        //! yterst tillfällig ska egentligen loada ny snippet
                        currentLineIndex = currentLineIndex + 1;
                    }

                    code = document.getElementById(
                        'lineContent' + currentLineIndex
                    ).textContent;

                    codeWords = code.split(' ');
                    typedWords = [];
                }
            }
        }

        // document.querySelector('.input-field').style.left =
        //     hlTypedText.offsetWidth + 35 + 'px';
    }
});

loadSnippets('python');
displayText(true); // gör om displayText för den är skit och helt jälva piss
