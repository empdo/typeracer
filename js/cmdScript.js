'use strict';
var cmdOutput = document.getElementById('cmd-output-container');

class Command {
    constructor() {}

    /** @param {String} command */
    parse(command) {
        args = command.split(' ');
    }

    /// function handleCmdInput(e) {
}

function changeCmdOutput(templateName) {
    Array.from(cmdOutput.childNodes).forEach(e => {
        cmdOutput.removeChild(e);
    });
    var temp = document.getElementById(templateName);
    var clon = temp.content.cloneNode(true);
    cmdOutput.appendChild(clon);
}

var inputElement = document.querySelector('.cmd-input');

inputElement.addEventListener('input', e => {
    handleCmdInput(e);
});
