'use strict';

var timeAtStart = new Date();
var amountOfTokens = 0;

function setSpeed(currentLineIndex) {
    var textField = document.querySelector('.text-field');
    var amountOfCharacters = 0;
    textField.childNodes.forEach((e, i) => {
        var hlTypextElement = e.querySelector(
            `#lineContent${i} #hlTypedText-line${i}`
        );
        if (hlTypextElement) {
            hlTypextElement.childNodes.forEach(e2 => {
                amountOfCharacters += e2.textContent.length;
            });
        };
    });

    var timeDiffSek = (new Date() - timeAtStart) / 1000;
    document.getElementById('cpm').textContent =
        'cpm:' + Math.floor((amountOfCharacters * 60) / timeDiffSek);

    var hlTypedText = document.getElementById(
        'hlTypedText-line' + currentLineIndex
    );

    if (hlTypedText) {
        hlTypedText.childNodes.forEach(e => {
            amountOfTokens += 1;
        });

        document.getElementById('tkpm').textContent =
            'tkpm:' + Math.floor((amountOfTokens * 60) / timeDiffSek);
    }
}
