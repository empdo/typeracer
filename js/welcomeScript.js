var skipButton = document.getElementById('skip-button');
var welcomeText = 'Hello there human, welcome to..';
var welcomeObj = document.querySelector('.overlay-welcome-text');
var typeacerObj = document.querySelector('#overlay-text-container');
var time = 0;

function showTypeacer() {
    setTimeout(welcomeText => {
        welcomeObj.parentNode.removeChild(welcomeObj);
        typeacerObj.style.display = 'none';
        document.querySelector('.cmd-input').focus();
    }, time);
    time += 100;
}

window.onload = function () {

    Array.from(welcomeText).forEach((e, i) => {
        if (i === 18) {
            setTimeout(welcomeText => (welcomeObj.textContent += e), time);
            time += 600;
        } else if (i == welcomeText.length - 1) {
            setTimeout(welcomeText => {
                welcomeObj.textContent += e;
                welcomeObj.id = 'blink-anim';
                showTypeacer();
            }, time);
            time += 100;
        } else {
            setTimeout(welcomeText => (welcomeObj.textContent += e), time);
            time += 100;
        }
    });
};

skipButton.addEventListener("click", () => {
    typeacerObj.style.display = 'none';
})