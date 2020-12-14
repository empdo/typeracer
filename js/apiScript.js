"use strict";

async function getSnippets(language) {
    console.log(language)
    const questionUrl = ("https://api.essung.dev/snippets/" + (language || ""));
    const questionRespons = await fetch(questionUrl);
    const questionJson = await questionRespons.json();

    return questionJson;
}

async function getLanguages() {
    const langUrl = "https://api.essung.dev/langs";
    const langRespons = await fetch(langUrl);
    const langJson = await langRespons.json();

    return langJson;
}

async function getLeaderboad() {

    const lBUrl = "https://api.essung.dev/leaderboard";
    const lBRespons = await fetch(lBUrl);
    const lBJson = await lBRespons.json();

    return lBJson;
}

async function getUserInfo(id){

    const userUrl = "https://api.github.com/user/" + id;
    const userRespons = await fetch(userUrl);
    const userJson = await userRespons.json();
	console.log({"name": userJson["login"], "profilePic": userJson["avatar_url"]})

    return {"login": userJson["login"], "avatar_url": userJson["avatar_url"]};
}

async function userToken(code){
    const tokenUrl = "https://api.essung.dev/token/" + code;
    const tokenRespons = await fetch(tokenUrl);
    const tokenJson = await tokenRespons.json();

    return tokenJson["access_token"];
} 
async function getLoggedInUserInfo(){
	var response =  await(await fetch("https://api.github.com/user", headers = {Authorization: {"token" : localStorage.token}})).json();

	if (!response.ok){
		localStorage.token = "";	
		return null;
	}
}
