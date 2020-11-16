'use strict';
var cmdOutput = document.getElementById('cmd-output-container');

function handleCmdInput(e) {
    if (e.key === 'Enter') {
        if (e.target.value === 'help') {
            changeCmdOutput('help-template');
        } else if (e.target.value.slice(0, 2) === 'hl') {
            if (e.target.value.length === 2) {
                changeCmdOutput('help-template-hl')
            } else {
                var themeTag = document.getElementById('syntax-hl');
                themeTag.setAttribute(
                    'href',
                    `css/${e.target.value.slice(3)}.css`
                );
            }
        }
    }
}

function changeCmdOutput(templateName){
    Array.from(cmdOutput.childNodes).forEach(e => {
        cmdOutput.removeChild(e);
    });
    var temp = document.getElementById(templateName);
    var clon = temp.content.cloneNode(true);
    cmdOutput.appendChild(clon);
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
