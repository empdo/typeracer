'use strict';

var content = [{"profile-pic":"https://avatars3.githubusercontent.com/u/37713376?v=4&size=24","user-name":"empdo", "cpm":"324"},{"profile-pic":"https://avatars3.githubusercontent.com/u/29502264?v=4&size=24","user-name":"alvengaymers", "cpm":"2"}]

var listContainer = document.querySelector('#list-container')


content.forEach(e => {
	var liObj = document.createElement('li');
	
	liObj.style.listStyleImage = `url(${e["profile-pic"]})`;
	liObj.textContent = `${e["user-name"]} - ${e['cpm']}cpm`;
	listContainer.appendChild(liObj);

})
