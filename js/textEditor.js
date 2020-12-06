'use strict';

var hasEventListner = false;
var themeTag = document.getElementById('syntax-hl');

themeTag.setAttribute('href', `css/${localStorage.theme ? localStorage.theme : "atom_one"}.css`);




function resizeSidebar(rows) {
    var sideBar = document.getElementById('side-bar');

    sideBar.innerHTML = "";

    var i = 1;
    while (notOverflowing()) {
        var number = document.createElement('span');
        if (i < rows+1 /*number of rows of code */) {
            number.textContent = i;
            number.className = 'side-bar-number';
        } else {
            number.textContent = '~';
            number.classList = 'side-bar-symbol';
            number.id = 'side-bar-index' + i;
        }

        sideBar.appendChild(number);
        i++;
    }

    var lastSymbol = document.getElementById('side-bar-index' + (i - 1));
    lastSymbol.parentNode.removeChild(lastSymbol);

    function notOverflowing() {
        return (
            document.getElementById('text-editor-container').scrollHeight <
            window.innerHeight
        );
    }
    if (!hasEventListner){
        window.addEventListener('resize', e => resizeSidebar(rows));    
        hasEventListner = true;
    }
}


