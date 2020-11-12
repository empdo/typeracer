var welcomeText = 'Hello there human, welcome to..';
var welcomeObj = document.querySelector('#welcome-text');

window.onload = function () {
    var time = 0;

    Array.from(welcomeText).forEach((e, i) => {
        if (i === 18) {
            setTimeout(welcomeText => (welcomeObj.textContent += e), time);
            time += 600;
        }else if (i == (welcomeText.length -1)) {
            setTimeout(welcomeText => (welcomeObj.textContent += e) (welcomeObj.id = 'blink-anim'), time);
            time += 100;
            
        }else {
            setTimeout(welcomeText => (welcomeObj.textContent += e), time);
            time += 100;
        } 
    });



    //call blinking animation
};
