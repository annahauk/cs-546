/**
 * pdftotext --> poppler-utils

json: terms[n].tags
    Name: ProperNoun, FirstName, Person
    Locations: Place, Region
    Numbers: NumericValue, Cardinal, NumericValue, NumberRange
    Emails: Email,
    Urls: Url
    orgs: Organization
    Experiences: Date, Noun, Month
    Skills: Expression, 
 */

import compromise from "compromise";
import { Poppler } from "node-poppler";
import path from "path";

// Initialize Poppler object
const poppler = new Poppler();
// TESTING ONLY: Get path to file, for testing purposes hard coding to my resume
const testPdfPath = path.resolve("test-docs/zak-resume.pdf");
// Found on documentatino that they have pdfToText function: https://github.com/Fdawgs/node-poppler/blob/main/API.md#Poppler+pdfToText
// Looking up the text-file options found the debian docs on it, where we can just have it go to stdout instead of forcing us to save a file: https://manpages.debian.org/testing/poppler-utils/pdftotext.1.en.html
const pdfText = await poppler.pdfToText(testPdfPath, "-");
// console.log(pdfText)
// Conver the text into compromise doc to be able to do nlp
const doc = compromise(pdfText);
// Extract parts https://observablehq.com/@spencermountain/compromise-tags
// Do we wanna do this (create custom tags) with code stuff? https://observablehq.com/@spencermountain/compromise-tags#cell-147
const Names = doc.match();
console.log("Done");
