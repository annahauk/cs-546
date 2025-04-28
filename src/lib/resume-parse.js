// Parses resume to get key tags from the resume
import compromise from "compromise";
import { Poppler } from "node-poppler";
import path from "path";

// List of programming languages (there are 100s): https://en.wikipedia.org/wiki/List_of_programming_languages
const TERMS_AND_DOMAINS = {
	// Programming Languages
	Python: { tag: "ProgrammingLanguage", domain: "MachineLearning" },
	R: { tag: "ProgrammingLanguage", domain: "MachineLearning" },
	JavaScript: { tag: "ProgrammingLanguage", domain: "WebDevelopment" },
	HTML: { tag: "ProgrammingLanguage", domain: "WebDevelopment" },
	CSS: { tag: "ProgrammingLanguage", domain: "WebDevelopment" },
	Java: { tag: "ProgrammingLanguage", domain: "GeneralPurpose" },
	C: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	"C++": { tag: "ProgrammingLanguage", domain: "LowLevel" },
	Rust: { tag: "ProgrammingLanguage", domain: "LowLevel" },
	Go: { tag: "ProgrammingLanguage", domain: "SystemsProgramming" },
	Swift: { tag: "ProgrammingLanguage", domain: "MobileDevelopment" },
	"C#": { tag: "ProgrammingLanguage", domain: "GeneralPurpose" },
	PHP: { tag: "ProgrammingLanguage", domain: "WebDevelopment" },
	Ruby: { tag: "ProgrammingLanguage", domain: "WebDevelopment" },
	Julia: { tag: "ProgrammingLanguage", domain: "DataScience" },
	SQL: { tag: "ProgrammingLanguage", domain: "DataManagement" },
	MATLAB: { tag: "ProgrammingLanguage", domain: "ScientificComputing" },
	Fortran: { tag: "ProgrammingLanguage", domain: "ScientificComputing" },
	COBOL: { tag: "ProgrammingLanguage", domain: "LegacySystems" },
	OCaml: { tag: "ProgrammingLanguage", domain: "FunctionalProgramming" },
	Assembly: { tag: "ProgrammingLanguage", domain: "LowLevel" },

	// Machine Learning Libraries
	"scikit-learn": { tag: "Library", domain: "MachineLearning" },
	sklearn: { tag: "Library", domain: "MachineLearning" },
	TensorFlow: { tag: "Library", domain: "MachineLearning" },
	PyTorch: { tag: "Library", domain: "MachineLearning" },
	Keras: { tag: "Library", domain: "MachineLearning" },

	// Web Development Frameworks
	"Node.js": { tag: "Framework", domain: "WebDevelopment" },
	Node: { tag: "Framework", domain: "WebDevelopment" },
	Express: { tag: "Framework", domain: "WebDevelopment" },
	React: { tag: "Framework", domain: "WebDevelopment" },
	Angular: { tag: "Framework", domain: "WebDevelopment" },
	Vue: { tag: "Framework", domain: "WebDevelopment" },

	// Data Tools
	Pandas: { tag: "Library", domain: "DataAnalysis" },
	NumPy: { tag: "Library", domain: "DataAnalysis" },
	Matplotlib: { tag: "Library", domain: "DataVisualization" },
	Seaborn: { tag: "Library", domain: "DataVisualization" },

	// DevOps / Cloud
	Docker: { tag: "Tool", domain: "DevOps" },
	Kubernetes: { tag: "Tool", domain: "DevOps" },
	AWS: { tag: "CloudPlatform", domain: "Cloud" },
	Azure: { tag: "CloudPlatform", domain: "Cloud" },
	GCP: { tag: "CloudPlatform", domain: "Cloud" }
};

// For setting up our custom tags: https://observablehq.com/@spencermountain/compromise-constructor-methods
const setupCompromisePlugin = () => {
	// 1) Create dictionary/object of word : tag, (see above TERMS dictionary, need to make it global for tagDocWithCustomTerms)
	// 2) Create plugin object, at least one of the things has to be words: dictionary from 1)
	const customTermsPlugin = {
		words: Object.fromEntries(
			Object.entries(TERMS_AND_DOMAINS).map(([term, { tag }]) => [term, tag])
		)
	};
	compromise.plugin(customTermsPlugin);
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
	Object.keys(TERMS_AND_DOMAINS).forEach((term) => {
		doc.match(term).tag(TERMS_AND_DOMAINS[term].tag);
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
		ProgrammingLanguages: "#ProgrammingLanguage",
		Libraries: "#Library",
		Frameworks: "#Framework",
		Tools: "#Tool",
		CloudPlatforms: "#CloudPlatform"
	};
	const tags = {};
	for (const tagName in tagsMap) {
		tags[tagName] = doc.match(tagsMap[tagName]).out("array");
	}
	// Add the user's domains to the tags
	const collectedItems = [
		...tags.ProgrammingLanguages,
		...tags.Libraries,
		...tags.Frameworks,
		...tags.Tools,
		...tags.CloudPlatforms
	];
	tags.Domains = getDomainsFromTags(collectedItems);
	return tags;
};

const getDomainsFromTags = (tagsArray) => {
	const domains = new Set();
	tagsArray.forEach((tag) => {
		const entry = TERMS_AND_DOMAINS[tag];
		if (entry) {
			domains.add(entry.domain);
		}
	});
	return Array.from(domains);
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
	console.log("Tags: ", tags);
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
	// Get the areas the user is interested in
	return tags;
};

testMain();
