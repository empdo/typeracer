'use strict';

var hasEventListner = false;
var themeTag = document.getElementById('syntax-hl');
var bar = document.querySelector('#bottom-bar')
var rows = 0;

themeTag.setAttribute(
    'href',
    `css/${localStorage.theme ? localStorage.theme : 'atom_one'}.css`
);

function resizeSidebar(textField) {
    rows = textField ? textField.childNodes.length : rows;

    var sideBar = document.querySelectorAll('.side-bar');
    sideBar.forEach(e => {
        e.innerHTML = '';
    });
    sideBar.forEach(e => {
        if (window.getComputedStyle(e.parentNode).display !== 'none') {
            var i = 1;
            while (notOverflowing()) {
                var number = document.createElement('span');
                if (i < rows + 1 /*number of rows of code */) {
                    number.textContent = i;
                    number.className = 'side-bar-number';
                } else {
                    number.textContent = '~';
                    number.classList = 'side-bar-symbol';
                    number.id = 'side-bar-index' + i;
                }

                e.appendChild(number);
                i++;
            }

            var lastSymbol = document.getElementById(
                'side-bar-index' + (i - 1)
            );
            lastSymbol.parentNode.removeChild(lastSymbol);
        }
    });
    function notOverflowing() {
        return (
            document.getElementById('text-editor-container').scrollHeight<
            window.innerHeight
        );
    }
    if (!hasEventListner) {
        window.addEventListener('resize', e => resizeSidebar());
        hasEventListner = true;
    }
}

if (localStorage.token) {
    getLoggedInUserInfo().then(data => {
        if (data) {
            var container = document.querySelector('#login');
            var profilePic = document.querySelector('#profile-pic');
            var username = document.querySelector('#username');
            profilePic.src = data['avatar_url'];

	    profilePic.style.height = Math.floor(getComputedStyle(bar).height.slice(0, -2)) + "px";
	    console.log(getComputedStyle(bar).height.slice(0,-2))
            username.textContent = data['login'];

            container.innerHTML = '';
        }
    });
}

window.addEventListener("load", () => {
    resizeSidebar(document.querySelector(".input-field"));
});
