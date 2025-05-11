//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.

import { ObjectId } from "mongodb";

/**
 * Constant for all the tags and domains
 */
const TERMS_AND_DOMAINS = {
	python: { tag: "ProgrammingLanguage", domain: "MachineLearning" },
	r: { tag: "ProgrammingLanguage", domain: "MachineLearning" },
	javascript: { tag: "ProgrammingLanguage", domain: "Web" },
	html: { tag: "ProgrammingLanguage", domain: "Web" },
	css: { tag: "ProgrammingLanguage", domain: "Web" },
	java: { tag: "ProgrammingLanguage", domain: "GeneralPurpose" },
	c: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	"c++": { tag: "ProgrammingLanguage", domain: "LowLevel" },
	rust: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	go: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	swift: { tag: "ProgrammingLanguage", domain: "MobileDevelopment" },
	"c#": { tag: "ProgrammingLanguage", domain: "GeneralPurpose" },
	php: { tag: "ProgrammingLanguage", domain: "Web" },
	ruby: { tag: "ProgrammingLanguage", domain: "Web" },
	julia: { tag: "ProgrammingLanguage", domain: "Data" },
	sql: { tag: "ProgrammingLanguage", domain: "Data" },
	cobol: { tag: "ProgrammingLanguage", domain: "GeneralPurpose" },
	ocaml: { tag: "ProgrammingLanguage", domain: "GeneralPurpose" },
	assembly: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	scala: { tag: "ProgrammingLanguage", domain: "Data" },
	typescript: { tag: "ProgrammingLanguage", domain: "Web" },
	bash: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	shell: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	typescript: { tag: "ProgrammingLanguage", domain: "Web" },
	"scikit-learn": { tag: "Library", domain: "MachineLearning" },
	sklearn: { tag: "Library", domain: "MachineLearning" },
	tensorflow: { tag: "Library", domain: "MachineLearning" },
	pytorch: { tag: "Library", domain: "MachineLearning" },
	keras: { tag: "Library", domain: "MachineLearning" },
	xgboost: { tag: "Library", domain: "MachineLearning" },
	lightgbm: { tag: "Library", domain: "MachineLearning" },
	catboost: { tag: "Library", domain: "MachineLearning" },
	pandas: { tag: "Library", domain: "Data" },
	numpy: { tag: "Library", domain: "Data" },
	matplotlib: { tag: "Library", domain: "Data" },
	seaborn: { tag: "Library", domain: "Data" },
	polars: { tag: "Library", domain: "Data" },
	plotly: { tag: "Library", domain: "Data" },
	altair: { tag: "Library", domain: "Data" },
	huggingface: { tag: "Library", domain: "MachineLearning" },
	langchain: { tag: "Library", domain: "MachineLearning" },
	jquery: { tag: "Library", domain: "Web" },
	redux: { tag: "Library", domain: "Web" },
	opencv: { tag: "Library", domain: "AI" },
	nltk: { tag: "Library", domain: "NaturalLanguageProcessing" },
	spacy: { tag: "Library", domain: "NaturalLanguageProcessing" },
	"hugging face": { tag: "Library", domain: "NaturalLanguageProcessing" },
	langchain: { tag: "Library", domain: "NaturalLanguageProcessing" },
	"web3.js": { tag: "Library", domain: "Blockchain" },
	"node.js": { tag: "Framework", domain: "Web" },
	node: { tag: "Framework", domain: "Web" },
	express: { tag: "Framework", domain: "Web" },
	react: { tag: "Framework", domain: "Web" },
	angular: { tag: "Framework", domain: "Web" },
	vue: { tag: "Framework", domain: "Web" },
	"next.js": { tag: "Framework", domain: "Web" },
	flask: { tag: "Framework", domain: "Web" },
	django: { tag: "Framework", domain: "Web" },
	duckdb: { tag: "Tool", domain: "Data" },
	dbt: { tag: "Tool", domain: "Data" },
	powerbi: { tag: "Tool", domain: "Data" },
	tableau: { tag: "Tool", domain: "Data" },
	looker: { tag: "Tool", domain: "Data" },
	superset: { tag: "Tool", domain: "Data" },
	excel: { tag: "Tool", domain: "Data" },
	docker: { tag: "Tool", domain: "DevOps" },
	kubernetes: { tag: "Tool", domain: "DevOps" },
	aws: { tag: "CloudPlatform", domain: "Cloud" },
	azure: { tag: "CloudPlatform", domain: "Cloud" },
	gcp: { tag: "CloudPlatform", domain: "Cloud" },
	firebase: { tag: "CloudPlatform", domain: "Cloud" },
	snowflake: { tag: "Tool", domain: "Data" },
	databricks: { tag: "Tool", domain: "Data" },
	bigquery: { tag: "Tool", domain: "Data" },
	hadoop: { tag: "Tool", domain: "Data" },
	spark: { tag: "Tool", domain: "Data" },
	airflow: { tag: "Tool", domain: "Data" },
	mlflow: { tag: "Tool", domain: "MachineLearning" },
	openai: { tag: "Tool", domain: "MachineLearning" },
	jupyter: { tag: "Tool", domain: "Data" },
	vscode: { tag: "Tool", domain: "DevOps" },
	git: { tag: "Tool", domain: "DevOps" },
	github: { tag: "Tool", domain: "DevOps" },
	gitlab: { tag: "Tool", domain: "DevOps" },
	bitbucket: { tag: "Tool", domain: "DevOps" },
	jira: { tag: "Tool", domain: "DevOps" },
	postman: { tag: "Tool", domain: "Web" },
	mysql: { tag: "Tool", domain: "Data" },
	postgresql: { tag: "Tool", domain: "Data" },
	sqlite: { tag: "Tool", domain: "Data" },
	mongodb: { tag: "Tool", domain: "Data" },
	neo4j: { tag: "Tool", domain: "Data" },
	redis: { tag: "Tool", domain: "LowLevel" },
	sass: { tag: "Tool", domain: "Web" },
	less: { tag: "Tool", domain: "Web" },
	tailwind: { tag: "Framework", domain: "Web" },
	bootstrap: { tag: "Framework", domain: "Web" },
	"next.js": { tag: "Framework", domain: "Web" },
	django: { tag: "Framework", domain: "Web" },
	flask: { tag: "Framework", domain: "Web" },
	fastapi: { tag: "Framework", domain: "Web" },
	mongodb: { tag: "Database", domain: "Data" },
	postgresql: { tag: "Database", domain: "Data" },
	mysql: { tag: "Database", domain: "Data" },
	redis: { tag: "Tool", domain: "Data" },
	"power bi": { tag: "Tool", domain: "Data" },
	colab: { tag: "Tool", domain: "Data" },
	terraform: { tag: "Tool", domain: "DevOps" },
	ansible: { tag: "Tool", domain: "DevOps" },
	jenkins: { tag: "Tool", domain: "DevOps" },
	git: { tag: "Tool", domain: "DevOps" },
	"github actions": { tag: "Tool", domain: "DevOps" },
	circleci: { tag: "Tool", domain: "DevOps" },
	heroku: { tag: "CloudPlatform", domain: "Cloud" },
	netlify: { tag: "CloudPlatform", domain: "Cloud" },
	vercel: { tag: "CloudPlatform", domain: "Cloud" },
	unity: { tag: "Engine", domain: "GameDevelopment" },
	unreal: { tag: "Engine", domain: "GameDevelopment" },
	godot: { tag: "Engine", domain: "GameDevelopment" },
	blender: { tag: "Tool", domain: "GameDevelopment" },
	pinecone: { tag: "Tool", domain: "NaturalLanguageProcessing" },
	streamlit: { tag: "Tool", domain: "Web" },
	gradio: { tag: "Tool", domain: "Web" },
	kotlin: { tag: "ProgrammingLanguage", domain: "MobileDevelopment" },
	"react native": { tag: "Framework", domain: "MobileDevelopment" },
	flutter: { tag: "Framework", domain: "MobileDevelopment" },
	xamarin: { tag: "Framework", domain: "MobileDevelopment" },
	"objective-c": { tag: "ProgrammingLanguage", domain: "MobileDevelopment" },
	solidity: { tag: "ProgrammingLanguage", domain: "Blockchain" },
	ethereum: { tag: "Platform", domain: "Blockchain" },
	hyperledger: { tag: "Platform", domain: "Blockchain" },
	metamask: { tag: "Tool", domain: "Blockchain" },
	truffle: { tag: "Tool", domain: "Blockchain" },
	ganache: { tag: "Tool", domain: "Blockchain" },
	hardhat: { tag: "Tool", domain: "Blockchain" },
	wireshark: { tag: "Tool", domain: "Cybersecurity" },
	nmap: { tag: "Tool", domain: "Cybersecurity" },
	metasploit: { tag: "Tool", domain: "Cybersecurity" },
	"burp suite": { tag: "Tool", domain: "Cybersecurity" },
	"kali linux": { tag: "Tool", domain: "Cybersecurity" },
	snort: { tag: "Tool", domain: "Cybersecurity" },
	splunk: { tag: "Tool", domain: "Cybersecurity" },
	osint: { tag: "Concept", domain: "Cybersecurity" },
	soc: { tag: "Concept", domain: "Cybersecurity" },
	siem: { tag: "Tool", domain: "Cybersecurity" },
	zap: { tag: "Tool", domain: "Cybersecurity" },
	prometheus: { tag: "Tool", domain: "DevOps" },
	grafana: { tag: "Tool", domain: "DevOps" },
	datadog: { tag: "Tool", domain: "DevOps" },
	"new relic": { tag: "Tool", domain: "DevOps" },
	postman: { tag: "Tool", domain: "Web" },
	swagger: { tag: "Tool", domain: "Web" },
	openapi: { tag: "Standard", domain: "Web" },
	redshift: { tag: "Tool", domain: "Data" },
	etl: { tag: "Concept", domain: "Data" },
	elt: { tag: "Concept", domain: "Data" },
	olap: { tag: "Concept", domain: "Data" },
	oltp: { tag: "Concept", domain: "Data" },
	"data lake": { tag: "Concept", domain: "Data" },
	"data warehouse": { tag: "Concept", domain: "Data" },
	"feature store": { tag: "Tool", domain: "Data" },
	"data governance": { tag: "Concept", domain: "Data" },
	"data engineering": { tag: "Concept", domain: "Data" },
	"data science": { tag: "Concept", domain: "Data" },
	"machine learning": { tag: "Concept", domain: "AI" },
	"deep learning": { tag: "Concept", domain: "AI" },
	"reinforcement learning": { tag: "Concept", domain: "AI" },
	nlp: { tag: "Concept", domain: "AI" },
	llm: { tag: "Concept", domain: "AI" },
	chatgpt: { tag: "Tool", domain: "AI" },
	bert: { tag: "Model", domain: "AI" },
	gpt: { tag: "Model", domain: "AI" },
	langchain: { tag: "Tool", domain: "AI" },
	"hugging face": { tag: "Platform", domain: "AI" },
	mlflow: { tag: "Tool", domain: "AI" },
	dvc: { tag: "Tool", domain: "AI" },
	"vertex ai": { tag: "Tool", domain: "Cloud" },
	sagemaker: { tag: "Tool", domain: "Cloud" },
	"azure ml": { tag: "Tool", domain: "Cloud" },
	"ci/cd": { tag: "Concept", domain: "DevOps" },
	chef: { tag: "Tool", domain: "DevOps" },
	puppet: { tag: "Tool", domain: "DevOps" },
	linux: { tag: "OperatingSystem", domain: "GeneralPurpose" },
	unix: { tag: "OperatingSystem", domain: "GeneralPurpose" },
	bash: { tag: "Shell", domain: "GeneralPurpose" },
	zsh: { tag: "Shell", domain: "GeneralPurpose" },
	powershell: { tag: "Shell", domain: "GeneralPurpose" },
	regex: { tag: "Concept", domain: "GeneralPurpose" },
	agile: { tag: "Concept", domain: "GeneralPurpose" },
	scrum: { tag: "Concept", domain: "GeneralPurpose" },
	kanban: { tag: "Concept", domain: "GeneralPurpose" }
};

const ACHIEVEMENTS = {
	created: [
		{name: "GitInit", description: "Linked a GitHub account with your profile" }
	],
	post: [
		{name: "Coder", description: "Created your first post" },
		{name: "Hard at Work", description: "Created 10 posts" },
		{name: "Elite Developer", description: "Created 50 posts" },
		{name: "Git Master", description: "Created 100 posts" }
	],
	comment: [
		{name: "Hello World!", description: "Left your first commented on another user's post" },
		{name: "Chatterbox", description: "Left 10 comments on other users' posts" },
		{name: "Master of Yap", description: "Left 50 comments on other users' posts" },
		{name: "It's me, Gossip Girl", description: "Left 100 comments on other users' posts" }
	],
	join: [
		{name: "Checkout", description: "Joined your first project as a contributor" },
		{name: "The Ol' Reliable", description: "Joined 10 projects as a contributor" },
		{name: "Git MVP", description: "Joined 50 projects as a contributor" }
	],
	othersJoined: [
		{name: "Project Leader", description: "Have another user join one of your projects for the first time" },
		{name: "Head of Ops", description: "Have another user join one of your projects 10 times" },
		{name: "CEO", description: "Have another user join one of your projects 50 times" }
	],
	friends: [
		{name: "Best Buds", description: "Added your first friend" },
		{name: "We should start a podcast!", description: "Added 10 friends" },
		{name: "Squad Goals", description: "Added 50 friends" },
		{name: "Popular", description: "Added 100 friends" },
		{name: "Class President", description: "Added 200 friends" },
		{name: "Infleuncer", description: "Added 500 friends" },
		{name: "Celebrity", description: "Added 1000 friends" }
	]
}

/**
 * Validates that the input is a non-empty string.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The trimmed string if valid.
 */
function stringVal(val, varName = "value", funcName = "stringVal") {
	if (typeof val !== "string" || val.trim().length === 0) {
		throw `Error in ${funcName}: ${varName} must be a non-empty string.`;
	}
	return val.trim();
}

/**
 * Validates that the input contains only letters and numbers.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The validated string if valid.
 */
function onlylettersandnumbers(
	val,
	varName = "value",
	funcName = "onlylettersandnumbers"
) {
	if (!/^[a-zA-Z0-9]+$/.test(val)) {
		throw `Error in ${funcName}: ${varName} must contain only letters and numbers.`;
	}
	return val;
}

/**
 * Validates that the input contains only letters.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The validated string if valid.
 */
function onlyletters(val, varName = "value", funcName = "onlyletters") {
	if (!/^[a-zA-Z]+$/.test(val)) {
		throw `Error in ${funcName}: ${varName} must contain only letters.`;
	}
	return val;
}

/**
 * Validates that the input is a non-empty array with string elements.
 * @param {Array} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {Array} - The validated array if valid.
 */
function arrayVal(val, varName = "value", funcName = "arrayVal") {
	if (!Array.isArray(val) || val.length === 0) {
		throw `Error in ${funcName}: ${varName} must be a non-empty array.`;
	}
	for (const item of val) {
		if (typeof item !== "string" || item.trim().length === 0) {
			throw `Error in ${funcName}: ${varName} must contain only non-empty strings.`;
		}
	}
	return val;
}

/**
 * Validates that the input is a valid ObjectId string.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The validated ObjectId string if valid.
 */
function idVal(val, varName = "value", funcName = "idVal") {
	if (typeof val !== "string" || val.trim().length === 0) {
		throw `Error in ${funcName}: ${varName} must be a non-empty string.`;
	}
	if (!ObjectId.isValid(val)) {
		throw `Error in ${funcName}: ${varName} is not a valid ObjectId.`;
	}
	return val.trim();
}

/**
 * Returns boolean if every item in array conforms to validator function
 * throws otherwise
 * @param {*} array
 * @param {*} type
 */
function validateArray(array, validator) {
	if (!Array.isArray(array)) {
		throw new Error(`Not an array.`);
	}

	for (const item of array) {
		if (!validator(item)) {
			throw new Error(`Array failed validation.`);
		}
	}

	return true;
}

// Zak: Copied over helper functions from labs
/**
 * Validates a username string according to the following rules:
 * - Must be a non-empty string (not just spaces)
 * - Length must be between 5 and 10 characters (inclusive)
 * - Can only contain letters (A-Z, a-z) and numbers (0-9)
 * Throws an error with a descriptive message if validation fails.
 * @param {string} val - The username to validate
 * @param {string} varName - The variable name for error messages
 * @param {string} funcName - The function name for error messages
 * @returns {string} - The trimmed, validated username
 */
const validateUserID = (val, varName, funcName) => {
	if (!val || typeof val !== "string" || val.trim() === "") {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" does not exist or is all spaces"
		);
	}
	// Trim inputs!
	val = val.trim();
	// Check length
	if (val.length < 5 || val.length > 10) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must be at least 5 characters and no more than 10 characters"
		);
	}
	// Check that it contains only charactesr or positive whole numbers
	if (!/^[A-Za-z0-9]+$/.test(val)) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain only letters or positive whole numbers"
		);
	}
	return val;
};

/**
 * Validates a password string according to the following rules:
 * - Must be a non-empty string (not just spaces)
 * - Must not contain any spaces
 * - Must be at least 8 characters long
 * - Must contain at least one uppercase letter
 * - Must contain at least one number
 * - Must contain at least one special character (not a letter, number, or space)
 * Throws an error with a descriptive message if validation fails.
 * @param {string} val - The password to validate
 * @param {string} varName - The variable name for error messages
 * @param {string} funcName - The function name for error messages
 * @returns {string} - The validated password
 */
const validatePassword = (val, varName, funcName) => {
	if (!val || typeof val !== "string" || val.trim() === "") {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must be a non-empty string and cannot consist of only spaces"
		);
	}
	// Check there are no spaces in password
	if (/\s/.test(val)) {
		throw (
			"Error in " + funcName + ": " + varName + " must not contain any spaces"
		);
	}
	// Check length
	if (val.length < 8) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must be at least 8 characters long"
		);
	}
	// Check that there is at least one uppercase letter
	if (!/[A-Z]/.test(val)) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain at least one uppercase letter"
		);
	}
	// Check there is at least one number
	if (!/[0-9]/.test(val)) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain at least one number"
		);
	}
	// Check there are no spaces in password
	if (/\s/.test(val)) {
		throw (
			"Error in " + funcName + ": " + varName + " must not contain any spaces"
		);
	}
	// Check there is at least one special character
	let hasSpecialCharacter = false;
	for (let i = 0; i < val.length; i++) {
		const char = val[i];
		// Check if the character is not a letter, number, or space
		if (!/[A-Za-z0-9\s]/.test(char)) {
			hasSpecialCharacter = true;
			break;
		}
	}
	if (!hasSpecialCharacter) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain at least one special character"
		);
	}
	return val;
};

/**
 * throw error if not a valid object id
 * @param {ObjectId} objid
 */
async function validObjectId(objid) {
	if (!ObjectId.isValid(objid)) {
		throw new Error(`Invalid ObjectId.`);
	}
}

export {
	arrayVal,
	idVal,
	onlyletters,
	onlylettersandnumbers,
	stringVal,
	validateArray,
	validatePassword,
	validateUserID,
	validObjectId,
	TERMS_AND_DOMAINS,
	ACHIEVEMENTS
};
