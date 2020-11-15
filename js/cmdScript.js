'use strict';
var cmdOutput = document.getElementById('cmd-output-container');

function handleCmdInput(e) {
    if (e.key === 'Enter') {
        if (e.target.value === 'help') {
            Array.from(cmdOutput.childNodes).forEach(e => {
                cmdOutput.removeChild(e);
            });
            var temp = document.getElementById('help-template');
            var clon = temp.content.cloneNode(true);
            cmdOutput.appendChild(clon);
        }
    }
}

var inputElement = document.querySelector('.cmd-input');
inputElement.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        handleCmdInput(e);
    }
});
inputElement.addEventListener('input', e => {
    handleCmdInput(e);
});
