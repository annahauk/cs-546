//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.

import moment from 'moment';
import { ObjectId } from 'mongodb';

// string validation

function exists(parameter) {
  if (!parameter){
    throw `No parameter passed in`;
  }
  return parameter;
}

function stringVal(str) {
    str = exists(str);
    if (typeof str !== 'string'){
        throw `${str} is not a string`;
    }
    str = str.trim();
    if (str.length === 0){
        throw `${str} is empty spaces`;
    }
    return str;
};

// to check if just letters a-z, A-Z and numbers
function onlylettersandnumbers(str) {
    str = stringVal(str);
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (
            !(charCode >= 48 && charCode <= 57) &&  // '0' to '9'
            !(charCode >= 65 && charCode <= 90) &&  // 'A' to 'Z'
            !(charCode >= 97 && charCode <= 122) && // 'a' to 'z'
            !(charCode === 32)                      // space
        ) {
            throw 'String must contain only letters and numbers';
        }
    }
    return str;
}

// to check if just letters a-z and A-Z
function onlyletters(str){
    str = stringVal(str);
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (
            !(charCode >= 65 && charCode <= 90) &&  // 'A' to 'Z'
            !(charCode >= 97 && charCode <= 122) && // 'a' to 'z'
            !(charCode === 32)                      // space
        ) {
            throw 'String must contain only letters and numbers';
        }
    }
    return str;
};

// check if arraytype, empty, each elem = string, each elem not empty
// trims the string element
function arrayVal(arr) {
    if (!arr || !Array.isArray(arr)) throw 'You must provide an array';
    if (arr.length === 0) throw 'Array cannot be empty';
    for (let i in arr) {
        if (typeof arr[i] !== 'string' || arr[i].trim().length === 0){
            throw 'One or more elements is not a string or is an empty string';
        }
        arr[i] = arr[i].trim();
    }
    return arr;
};


function genreVal(genre){
    genre = stringVal(genre);
    genre = onlyletters(genre);
    if (genre.length < 5) throw 'Genre must have at least 5 characters';
    return genre;
};

// used when iterating through the array of names 
// runs stringVal and onlyletters 
// >= 5 char, >= 3 char for first name and last name, only letters, only one space
function nameVal(name) {
    name = stringVal(name);
    name = onlyletters(name);
    if (name.length < 5) throw 'Name must have at least 5 characters';
    
    // if more than one space between firstName and lastName, throw error
    let nameverif = name.split(' ');
    // drop " " from array
    nameverif = nameverif.filter(function (el) {
        return el != '';
    });
    if (nameverif.length > 2) throw 'Name must have at most 2 parts';
    if (nameverif.length === 2){
        if (nameverif[0].length < 3 || nameverif[1].length < 3) throw 'First name and last name must have at least 3 characters';
    }
    return name;
};

function spaceChecking(name){
    // check if more than one space between firstName and lastName
    let spacecount = 0;
    for(let i in name){
        if (name[i] === ' ') spacecount++;
    }
    if (spacecount > 1) throw 'Name must have at most 1 space';
    return name;
}
function idVal(id){
    if (!id) throw 'You must provide an id to search for';
    if (typeof id !== 'string') throw 'Id must be a string';
    if (id.trim().length === 0)
        throw 'Id cannot be an empty string or just spaces';
    id = id.trim();
    // have to check if this is a valid id
    if (!ObjectId.isValid(id)) throw 'invalid object ID';
    
    return id;
};

function dateVal(date){
    date = stringVal(date);

    // moment for parsing and validating dates
    if (!moment(date, 'MM/DD/YYYY', true).isValid()) {
        throw 'Date is not valid';
    }
    // parse date into moment object

    const parsedDate = moment(date, 'MM/DD/YYYY');

    // get current year
    const currentYear = moment().year();

    // years 1900 - 2027 are valid
    const minDate = moment('01/01/1900', 'MM/DD/YYYY');
    // +2 years of parsed date
    const maxDate = moment().add(2, 'years');

    // validate that the date is between min and max
    if (parsedDate.isBefore(minDate) || parsedDate.isAfter(maxDate)) {
        throw `Date is not between 1900 and ${currentYear + 2}`;
    }
    return date;
}

function validateRuntime(runtime) {
    // Trim and validate the runtime string
    runtime = stringVal(runtime);

    // split the runtime string
    let runtimeArr = runtime.split(' ');

    // Check if the runtime is in the format "#h #min"
    if (runtimeArr.length === 1 || runtimeArr.length > 2) {
        // Only hours or only minutes
        throw 'Runtime must be in the format "#h #min"';
    }

    // for da hour
    let hours = runtimeArr[0].split('h')[0];
    if(hours.includes('.')){
        throw 'Runtime hours must be a whole number';
    }

    // for da min
    let minutes = runtimeArr[1].split('min')[0];
    if(minutes.includes('.')){
        throw 'Runtime minutes must be a whole number';
    }
    
    // check if whole number
    if(Number.isInteger(parseFloat(hours)) === false || Number.isInteger(parseFloat(minutes)) === false){
        throw 'Runtime must be a whole number';
    }

    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if(hours === 0 && minutes < 31){
        throw 'Runtime must be at least 31 minutes if hours is 0';
    }

    if(hours < 0 || hours > 8){
        throw 'Hours must be a positive whole number up to 8';
    }
    if (minutes < 0 || minutes > 59){
        throw 'Minutes must be a positive whole number up to 59';
    }

    return runtime;
};

/**
 * validLength takes a value like a string ex: Name. The inputted min would be the min chars allowed (at least), the inputted max if any is max chars allowed (at most)
 * @param {*} value 
 * @param {*} min 
 * @param {*} max 
 */
function validLength(value, min, max){
    if (val.length < min){ //At least min
        throw `Value: ${value}, does not meet minimum length requirement: ${min}`
    } else if( max == null){ //accounts for no max
        return
    } else if (val.length > max){ //At maximum max
        throw `Value: ${value}, does not meet maximum length requirement: ${max}`
    }
}

export {exists, stringVal, onlylettersandnumbers, onlyletters, arrayVal, genreVal, nameVal, idVal, spaceChecking, dateVal, validateRuntime, validLength};
