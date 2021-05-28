'use strict';
var helpContainer = document.querySelector('#right-side');
var helpFileName = document.querySelector('#help-file-name');
var helpPage = document.querySelector('#help-page');
var cmdOutput = document.getElementById('typeracer-container');

var availableLang = [];
getLanguages().then(data => {
	availableLang = data;
})

const availableHl = ['atom_one', 'dracula', 'monokai', 'solarized'];
var currentHl =  0;
var availableLang = [];

function getRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

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
    helpMsg = `Usage: typeracer <${availableLang}>`;

    execute(args) {
			if (args.length < 1){
					var args = [];
					args.push(getRandom(availableLang))
			}
            if (availableLang.includes(args[0])) {
                var typeracerContainer = document.querySelector(
                    '.typeracer-container'
                );
                var landingpage = document.querySelector('#landing-page');
                typeracerContainer.style.display = 'inline-block';
                landingpage.style.display = 'none';

		loadSnippets(args[0]);
		document.querySelector("#close-button").style.display = "inline-block";
    }
}
}

class Highlightning extends Command {
    helpMsg = 'Usage: hl <atom_one, monokai, solarized, dracul>';

    execute(args) {
		if (args.length < 1){
            currentHl += 1;
            args = [availableHl[currentHl % availableHl.length]];
		}

        console.log(args)
        if (!availableHl.includes(args[0])) {
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

		document.querySelector("#close-button").style.display = "inline-block";
    }
}

class CloseWindow extends Command {
    helpMsg = 'closes helppage or current game';

    execute(args) {
		var landingpage = document.querySelector('#landing-page');
		var typeracerContainer = document.querySelector(
			'.typeracer-container'
		);

		if (landingpage.style.display === "none"){
				landingpage.style.display = "grid";
				typeracerContainer.style.display = "none"

                resizeSidebar(document.querySelector(".input-field"));

		}
        helpContainer.style.display = 'none';
        helpFileName.style.display = 'none';
		document.querySelector("#close-button").style.display = "none";
    }
}
class Login extends Command {
    helpMsg = "Usage: authorize with github"
    execute(){
	window.location.replace(`https://github.com/login/oauth/authorize?client_id=9b3060d8b4ddf1f2a7b8&redirect_uri=${encodeURIComponent(window.location.origin + '/login.html')}`)
    }
}
class Leaderboard extends Command {
    helpMsg = ""
    execute(){
		window.location.assign("/leaderboard.html")
	}
}

const commands = {
    help: new HelpCommand(),
    typeracer: new TyperacerCommand(),
    hl: new Highlightning(),
    q: new CloseWindow(),
    ls: new List(),
    login: new Login(),
    leaderboard: new Leaderboard(),
};

const defaultCommand = new Command();

function parseCommand(command) {
    const args = command.split(' ')
    const mainArg = args[0];
    var commandObj = defaultCommand;
    if (mainArg in commands) {
        commandObj = commands[mainArg];
    }
    const templateName = commandObj.execute(args.slice(1));
}
var cmdInputElement = document.getElementById('cmd-input');
var inputForm = document.getElementById('cmd-container');

inputForm.addEventListener('submit', e => {
    e.preventDefault();
    parseCommand(cmdInputElement.value);
    cmdInputElement.value = '';
    changeMode('normal');
});

var commandsList = document.querySelectorAll('.command');
document.addEventListener('click', e => {
			parseCommand(e.target.dataset.command)
		}
)

//TODO: om man kör multiplayer så blir det split screen, som vim
