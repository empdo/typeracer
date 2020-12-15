'use strict';

var mode = {insert: false, normal: false, commandLine: false};

var code = '';
var snippets;
var currentLineIndex = 0;
var nextLineIndex = 0;
var snippet;

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
    currentLanguage = lang;

    getSnippets(lang).then(data => {
        snippets = data;
        console.log(snippets);
        setSnippet();
    });
}

function setSnippet() {
    var previusSnippet = snippet ? snippet[0] : "";
    var textField = document.querySelector('.text-field');
    var childrenToRemove = []; //tar man bort dom dirket kommer en skippas
    textField.childNodes.forEach(e => {
        childrenToRemove.push(e);
    });
    childrenToRemove.forEach(e => {
        e.parentNode.removeChild(e);
    });

    document.querySelector('.input-field').style.left = 0 + 'px';
    document.querySelector('.input-field').style.top = 0 + 'px';

    currentLineIndex = 0;
    nextLineIndex = 0;

    snippet = getRandom(snippets).snippet.split('\n');
    snippet = snippet.filter(e => e);
    console.log(snippet);

    if (snippet[0] !== previusSnippet) {
        snippet.forEach((e, i) => {
            var line = document.createElement('div');
            line.id = 'line' + i;

            var lineContent = document.createElement('span');

            lineContent.classList.add('remaining-text');
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
            lineHlTypedText.classList.add('hlTypedText-line');

            [indenting, lineContent, lineHlTypedText].forEach(e =>
                line.appendChild(e)
            );

            textField.append(line);
        });

        resizeSidebar(document.querySelector(".text-field"));

        var hlTypedText = document.getElementById(
            'hlTypedText-line' + currentLineIndex
        );

        code = document.getElementById('lineContent0').textContent;
        codeWords = code.split(' ');
        typedWords = [];
        hlTypedText.textContent = '';
    }
    displayText(true);
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
        setSpeed(currentLineIndex);
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
                ? hlTypedText.offsetWidth + document.getElementById('indent' + nextLineIndex).offsetWidth
                : document.getElementById('indent' + nextLineIndex).offsetWidth;
        document.querySelector('.input-field').style.left =
            objToOffset + 'px';
        document.querySelector('.input-field').style.top =
            nextLineIndex * 23 + 'px';

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
inputElement.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (!document.getElementById('lineContent' + (currentLineIndex + 1))) {
            typedWords.push(e.target.value);
            if (compareInput()) {
                e.target.value = '';
                setSnippet(currentLanguage);
            }
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
                        //! yterst tillf�llig ska egentligen loada ny snippet
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
    }
    // document.querySelector('.input-field').style.left =
    //     hlTypedText.offsetWidth + 35 + 'px';
});

function changeMode(modeToChange) {
    var cmdContainer = document.querySelector('#cmd-container');
    var fileContainer = document.querySelector('#file-info-container');
    var cmdInput = document.querySelector('#cmd-input');

    for (var i in mode) {
        if (i === modeToChange) {
            mode[i] = true;
            document.getElementById(
                'editor-mode'
            ).textContent = modeToChange.toUpperCase();
            inputElement.readOnly = !mode['insert'];
        } else {
            mode[i] = false;
        }
    }

    if (modeToChange == 'commandLine') {
        cmdContainer.style.display = 'inline';
        fileContainer.style.display = 'none';
        cmdInput.focus();
    } else if (modeToChange == 'insert'){
	timeAtStart = new Date()	
        document.querySelector('.input-field').focus();
        
	cmdContainer.style.display = 'none';
        fileContainer.style.display = 'inline';
    }else {
        cmdContainer.style.display = 'none';
        fileContainer.style.display = 'inline';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === ':' && !mode['commandLine'] && !mode['insert']) {
	changeMode('commandLine');
	e.preventDefault();
    } else if (e.key === 'Escape' && !mode['normal']) {
        changeMode('normal');
    } else if (e.key === 'i' && !mode['insert'] && !mode['commandLine']) {	
        changeMode('insert');
        e.preventDefault();
    }

    if (e.key === ':' || e.key === 'Escape' || e.key === 'i') {
        console.log(mode);
    }
});

inputElement.addEventListener('input', handleInput);

changeMode('normal');
console.log(inputElement);


