var welcomeText = 'Hello there human, welcome to..';
var welcomeObj = document.querySelector('#welcome-text');
var typeacerObj = document.querySelector('#typeacer-text');
var time = 0;

function showTypeacer() {
    setTimeout(welcomeText => {
        welcomeObj.parentNode.removeChild(welcomeObj);
        location.replace("/index2.html")

    }, time);
    time += 100;
}

window.onload = function () {
    typeacerObj.style.color = 'transparent';

    Array.from(welcomeText).forEach((e, i) => {
        if (i === 18) {
            setTimeout(welcomeText => (welcomeObj.textContent += e), time);
            time += 600;
        } else if (i == welcomeText.length - 1) {
            setTimeout(welcomeText => {
                welcomeObj.textContent += e;
                welcomeObj.id = 'blink-anim';
                showTypeacer();
                //shit i det och gör så att den går till terminalen direkt och säger program crashed
            }, time);
            time += 100;
        } else {
            setTimeout(welcomeText => (welcomeObj.textContent += e), time);
            time += 100;
        }
    });

    //show typeacer and shake
};
