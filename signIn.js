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
	console.log(leaderboard)
	leaderboard.forEach(e => {
		var liObj = document.createElement('li');

		liObj.style.listStyleImage = `url(${e["avatar"]}?v=4&size=24)`;
		liObj.textContent = `${e["name"]} - ${e['cpm']}cpm`;
		listContainer.appendChild(liObj);

	})
});
