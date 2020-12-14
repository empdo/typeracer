'use strict';
var listContainer = document.querySelector('#list-container')

async function getFullLeaderboard() {
	const data = await getLeaderboad();
	return Promise.all(data.map(async (user) => {
		const userInfo = await getUserInfo(user["github-id"]);
		return({"name" :  userInfo["login"], "avatar": userInfo["avatar_url"], "cpm": user["cpm"]})
	}))
}

getFullLeaderboard().then(leaderboard => {
	leaderboard.sort((a, b) => {return b.cpm - a.cpm})

	leaderboard.forEach(e => {
		var liObj = document.createElement('li');

		liObj.textContent = `${e["name"]} - ${e['cpm']}cpm`;
		liObj.style.listStyleImage = `url(${e["avatar"]}?v=4&size=24)`;
		listContainer.appendChild(liObj);

	})
});

if(localStorage.token){
	getLoggedInUserInfo().then(data => {
		if(data){
			var container = document.querySelector("#profile-container")
			var profilePic = document.createElement("img")	
			var username = document.createElement("span");
			profilePic.src = data["avatar_url"];
			username.textContent = data["login"]

			[profilePic, username].forEach(e => {container.appendChild(e)})
		}
	})
}
