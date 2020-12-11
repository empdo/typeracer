'use strict';
var helpContainer = document.querySelector('#right-side');
var helpFileName = document.querySelector('#help-file-name');
var helpPage = document.querySelector('#help-page');
var cmdOutput = document.getElementById('typeracer-container');
const availableHl = ['atom_one', 'dracula', 'monokai', 'solarized'];
var availableLang = [];

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
    helpMsg = `Usage: typeracer <${getLanguages().then(data => {return(data)})}>`;

    execute(args) {
        getLanguages().then(data => {
            availableLang = data;

            if (availableLang.includes(args[0])) {
                var typeracerContainer = document.querySelector(
                    '.typeracer-container'
                );
                var landingpage = document.querySelector('#landing-page');
                typeracerContainer.style.display = 'inline-block';
                landingpage.style.display = 'none';

		loadSnippets(args[0]);

                console.log(availableLang);
            }
        });
    }
}

class Highlightning extends Command {
    helpMsg = 'Usage: hl <atom_one, monokai, solarized, dracul>';

    execute(args) {
        if (args.length === 0 || !availableHl.includes(args[0])) {
            helpContainer.style.display = 'grid';
            helpFileName.style.display = 'inline-block';
            helpPage.textContent = this.helpMsg;
            resizeSidebar();
            return; //TODO: kommer skriva över typeracer
        }
        var themeTag = document.getElementById('syntax-hl');
        console.log(themeTag);
        themeTag.setAttribute('href', `css/${args[0]}.css`);
        localStorage.theme = args[0];
    }
}

class List extends Command {
    execute(args) {
	    console.log("hej1")
        if (args[0] === 'hl') {
            helpContainer.style.display = 'grid';
            helpFileName.style.display = 'inline-block';
            helpPage.textContent = new Highlightning().helpMsg;
            resizeSidebar();
        }else if (args[0] === 'langs'){
            helpContainer.style.display = 'grid';
            helpFileName.style.display = 'inline-block';
            helpPage.textContent = new TyperacerCommand().helpMsg;
            resizeSidebar();
	}
    }
}

class CloseWindow extends Command {
    helpMsg = 'closes stuff';

    execute(args) {
        helpContainer.style.display = 'none';
        helpFileName.style.display = 'none';
    }
}
const commands = {
    help: new HelpCommand(),
    typeracer: new TyperacerCommand(),
    hl: new Highlightning(),
    q: new CloseWindow(),
    ls: new List(),
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
var cmdInputElement = document.getElementById('cmd-input');
var inputForm = document.getElementById('cmd-container');

inputForm.addEventListener('submit', e => {
    e.preventDefault();
    parseCommand(cmdInputElement.value);
    cmdInputElement.value = '';
    changeMode('normal');
});

//TODO: om man kör multiplayer så blir det split screen, som vim
