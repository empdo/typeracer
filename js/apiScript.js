"use strict";

async function getSnippets(language) {
    const questionUrl = ("http://api.essung.dev/snippets/" + (language || ""));
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