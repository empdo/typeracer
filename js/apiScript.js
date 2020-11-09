"use strict";

async function getQuestions(language) {
    const questionUrl = "http://s1.essung.dev:5000/snippets/";
    const questionRespons = await fetch(questionUrl);
    const questionJson = await questionRespons.json();

    return questionJson;
}

async function getLanguages() {
    const langUrl = "http://s1.essung.dev:5000/langs/";
    const langRespons = await fetch(langUrl);
    const langJson = await langRespons.json();

    return langJson;
}