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
