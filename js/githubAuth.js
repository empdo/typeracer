'use strict';
var key = "9b3060d8b4ddf1f2a7b8";
//window.location.replace(`https://github.com/login/oauth/authorize?client_id=${key}`); 
var code = new URLSearchParams(window.location.search).get("code")

userToken(code).then(data => {
	window.localStorage.setItem("token", data);
	console.log(window.localStorage.token)

	window.location.replace("/index3.html")
})


