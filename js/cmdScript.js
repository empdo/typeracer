'use strict';
var cmdOutput = document.getElementById('typeracer-container');
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
        console.log(themeTag);
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
//    changeCmdOutput(templateName);
}


var cmdInputElement = document.getElementById("cmd-input");
var inputForm = document.getElementById("cmd-container");

inputForm.addEventListener('submit', e => {
    e.preventDefault();
    parseCommand(cmdInputElement.value);
    inputElement.value = "";
});







//TODO: om man kör multiplayer så blir det split screen, som vim
