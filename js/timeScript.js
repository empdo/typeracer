'use strict';

var timeAtStart = (timeAtStart = new Date().getTime());
console.log(timeAtStart);
var amountOfCharacters = 0;
var amountOfTokens = 0;

function setSpeed(currentLineIndex) {
    amountOfCharacters += 1;

    var timeDiffSek = (new Date().getTime() - timeAtStart) / 1000;
    document.getElementById('cpm').textContent =
        'cpm:' + Math.floor((amountOfCharacters * 60) / timeDiffSek);

        var hlTypedText = document.getElementById(
            'hlTypedText-line' + currentLineIndex
        )

        console.log(hlTypedText)
    if (
        hlTypedText
    ) {
        hlTypedText.childNodes.forEach(e => {
            amountOfTokens += 1;
        });

        document.getElementById('tkpm').textContent =
            'tkpm:' + Math.floor((amountOfTokens * 60) / timeDiffSek);
    }
}
