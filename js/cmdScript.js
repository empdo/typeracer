'use strict';
var cmdOutput = document.getElementById('cmd-output-container');

class Command {
    helpMsg;
    constructor() {}

    /** @param {String} command */
    execute(args) {
        console.log(args);
        return "command-not-found-template";
    }
}

class HelpCommand extends Command {
    helpMsg = "The help command";

    execute(args) {
        if (args.length > 0) {
            alert(commands[args[0]].helpMsg);
        }
        return "help-template";
    }

}

class TyperacerCommand extends Command {
    helpMsg = "Usage: typeracer <language>"

    execute(args) {
        return "typeracer-template";
    }
}

const commands = {
    help: new HelpCommand(),
    typeracer: new TyperacerCommand()
}

const defaultCommand = new Command();

function parseCommand(command) {
    const args = command.split(" ");
    const mainArg = args[0];
    var commandObj = defaultCommand;
    if (mainArg in commands) {
        commandObj = commands[mainArg]
    }
    const templateName = commandObj.execute(args.slice(1));
    changeCmdOutput(templateName);
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
var inputForm = document.querySelector(".cmd-form");
inputForm.addEventListener('submit', e => {
    e.preventDefault()
    parseCommand(inputElement.value)
});
