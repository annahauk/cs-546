// Parses resume to get key tags from the resume
import compromise from "compromise";
import { Poppler } from "node-poppler";
import path from "path";

// List of programming languages (there are 100s): https://en.wikipedia.org/wiki/List_of_programming_languages
const TERMS = {
	Python: "ProgrammingLanguage",
	C: "ProgrammingLanguage",
	"C++": "ProgrammingLanguage",
	Java: "ProgrammingLanguage",
	"C#": "ProgrammingLanguage",
	JavaScript: "ProgrammingLanguage",
	"Visual Basic": "ProgrammingLanguage",
	SQL: "ProgrammingLanguage",
	"Assembly language": "ProgrammingLanguage",
	PHP: "ProgrammingLanguage",
	Scratch: "ProgrammingLanguage",
	Go: "ProgrammingLanguage",
	MATLAB: "ProgrammingLanguage",
	Fortran: "ProgrammingLanguage",
	COBOL: "ProgrammingLanguage",
	R: "ProgrammingLanguage",
	Ruby: "ProgrammingLanguage",
	Swift: "ProgrammingLanguage",
	Rust: "ProgrammingLanguage",
	Julia: "ProgrammingLanguage",
	HTML: "ProgrammingLanguage",
	CSS: "ProgrammingLanguage",
	OCaml: "ProgrammingLanguage"
};

// For setting up our custom tags: https://observablehq.com/@spencermountain/compromise-constructor-methods
const setupCompromisePlugin = () => {
	// 1) Create dictionary/object of word : tag, (see above TERMS dictionary, need to make it global for tagDocWithCustomTerms)
	// 2) Create plugin object, at least one of the things has to be words: dictionary from 1)
	const customTermsPlugin = { words: TERMS };
	// then, do nlp.plugin(plugin object from 2) )
	compromise.plugin(customTermsPlugin);
};

/* DEBUGGING: noticed in initial testing with the custom plugin that htings were not getting properly matched, need to manually tag?
    ┌─────────
    │ 'Programming'  - Verb, PresentTense, Gerund
    │ 'Languages'  - ProperNoun, Noun
    │ 'Python'   - ProperNoun, Noun
    │ 'Java'     - ProperNoun, Noun
    │ 'Javascript'  - ProperNoun, Noun
    │ 'HTML'     - Acronym, Noun
    │ 'CSS'      - Acronym, Noun
    │ 'C'        - Acronym, Noun
    │ 'SQL'      - ProgrammingLanguage
    │ 'R'        - Acronym, Noun
    │ 'OCaml'    - Noun, Singular
    */
// Manually tags all the words in terms https://observablehq.com/@spencermountain/compromise-tags
const tagDocWithCustomTerms = (doc) => {
	Object.keys(TERMS).forEach((term) => {
		doc.match(term).tag(TERMS[term]);
	});
};

const createAndTagDoc = (pdfText) => {
	const doc = compromise(pdfText);
	tagDocWithCustomTerms(doc);
	return doc;
};

const tagDocument = (doc) => {
	// Extract parts https://observablehq.com/@spencermountain/compromise-tags
	// Do we wanna do this (create custom tags) with code stuff? https://observablehq.com/@spencermountain/compromise-tags#cell-147
	const tagsMap = {
		Name: "#FirstName #LastName",
		CompaniesWorkedAt: "#Company",
		Activities: "#Activity",
		ProperNouns: "ProperNoun",
		ProgrammingLanguages: "#ProgrammingLanguage"
	};
	const tags = {};
	for (const tagName in tagsMap) {
		tags[tagName] = doc.match(tagsMap[tagName]).out("array");
	}
	return tags;
};

const testMain = async () => {
	// Initialize Poppler object and setup compromise plugin
	const poppler = new Poppler();
	setupCompromisePlugin();
	// TESTING ONLY: Get path to file, for testing purposes hard coding to my resume
	const testPdfPath = path.resolve("test-docs/zak-resume.pdf");
	// Found on documentation that they have pdfToText function: https://github.com/Fdawgs/node-poppler/blob/main/API.md#Poppler+pdfToText
	// Looking up the text-file options found the debian docs on it, where we can just have it go to stdout instead of forcing us to save a file: https://manpages.debian.org/testing/poppler-utils/pdftotext.1.en.html
	const pdfText = await poppler.pdfToText(testPdfPath, "-");
	// console.log(pdfText)
	// Conver the text into compromise doc to be able to do nlp
	const doc = createAndTagDoc(pdfText);
	const tags = tagDocument(doc);
	console.log(tags);
};

// Use this for actually getting the user's tags
const processUploadedResume = async (file) => {
	// Initialize Poppler object and setup compromise plugin
	const poppler = new Poppler();
	setupCompromisePlugin();
	// Get the path
	const pdfPath = path.resolve(file.path);
	// Found on documentation that they have pdfToText function: https://github.com/Fdawgs/node-poppler/blob/main/API.md#Poppler+pdfToText
	// Looking up the text-file options found the debian docs on it, where we can just have it go to stdout instead of forcing us to save a file: https://manpages.debian.org/testing/poppler-utils/pdftotext.1.en.html
	const pdfText = await poppler.pdfToText(pdfPath, "-");
	// console.log(pdfText)
	// Conver the text into compromise doc to be able to do nlp
	const doc = createAndTagDoc(pdfText);
	const tags = tagDocument(doc);
	console.log(tags);
	return tags;
};

testMain();
