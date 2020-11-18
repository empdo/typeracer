'use strict';
var cmdOutput = document.getElementById('cmd-output-container');
const availableHl = ['atom_one', 'dracula', 'monokai', 'solarized'];

class Command {
    helpMsg;
    constructor() {}

    /** @param {String} command */
    execute(args) {
        console.log(args);
        return 'command-not-found-template';
    }
}

class HelpCommand extends Command {
    helpMsg = 'The help command';

    execute(args) {
        if (args.length > 0) {
            alert(commands[args[0]].helpMsg);
        }
        return 'help-template';
    }
}

class TyperacerCommand extends Command {
    helpMsg = 'Usage: typeracer <language>';

    execute(args) {
        return 'typeracer-template';
    }
}

class Highlightning extends Command {
    helpMsg = 'Usage: hl <list of options>';

    execute(args) {
        if (args.length === 0 || !availableHl.includes(args[0])) {
            alert("theme not found")
            return ; //TODO: kommer skriva över typeracer
        }
        var themeTag = document.getElementById('syntax-hl');
        themeTag.setAttribute('href', `css/${args[0]}.css`);
    }
}

const commands = {
    help: new HelpCommand(),
    typeracer: new TyperacerCommand(),
    hl: new Highlightning(),
};

const defaultCommand = new Command();

function parseCommand(command) {
    const args = command.split(' '); //TODO: gp igenom och ta bort mellandslag§§
    const mainArg = args[0];
    var commandObj = defaultCommand;
    if (mainArg in commands) {
        commandObj = commands[mainArg];
    }
    const templateName = commandObj.execute(args.slice(1));
    changeCmdOutput(templateName);
}

function changeCmdOutput(templateName) {
    if (!templateName) return;
    Array.from(cmdOutput.childNodes).forEach(e => {
        cmdOutput.removeChild(e);
    });
    var temp = document.getElementById(templateName);
    if (!temp) {
        changeCmdOutput('help-template'); // TODO: gör error page
        return;
    }
    var clon = temp.content.cloneNode(true);
    cmdOutput.appendChild(clon);
}

var inputElement = document.querySelector('.cmd-input');
var inputForm = document.querySelector('.cmd-form');
inputForm.addEventListener('submit', e => {
    e.preventDefault();
    parseCommand(inputElement.value);
    inputElement.value = "";
});
