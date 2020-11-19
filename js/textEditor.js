'use strict';

var sideBar = document.getElementById('side-bar');

for (var i = 1; i < 41 ; i++) {
    var number = document.createElement('span');
    if (i < 12 /*number of rows of code */){
        number.textContent = i;
        number.className = ('side-bar-number')
    }else {
        number.textContent = "~";
        number.className = ('side-bar-symbol')
    }
    
    sideBar.appendChild(number);
}
