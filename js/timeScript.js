'use strict';

var timeAtStart = timeAtStart = new Date().getTime();
console.log(timeAtStart);
var amountOfCharacters = 0;

function setCpm(){
    amountOfCharacters += 1;

    var timeDiffSek = ((new Date().getTime() - timeAtStart) /1000);
    document.getElementById("cpm").textContent = "cpm:" + Math.floor(amountOfCharacters * 60 / (timeDiffSek));
}