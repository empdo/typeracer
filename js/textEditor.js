'use strict';

var sideBar = document.getElementById('side-bar');

for (var i = 1; i < 100 ; i++) {
    var number = document.createElement('span');
    number.className = ('side-bar-number')
    if (i < 12 /*number of rows of code */){
        number.textContent = i;
    }else {
        number.textContent = "~";
    }
    
    sideBar.appendChild(number);
}
