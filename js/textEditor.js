'use strict';

function resizeSidebar(rows) {
    var sideBar = document.getElementById('side-bar');

    sideBar.innerHTML = "";

    var i = 0;
    while (notOverflowing()) {
        var number = document.createElement('span');
        if (i < rows /*number of rows of code */) {
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
}


resizeSidebar(12);
window.addEventListener('resize', e => resizeSidebar(12));
