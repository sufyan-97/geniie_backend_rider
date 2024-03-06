const { body } = require('express-validator');
const { SIM_ID_PATTERN, EMAIL_REGEX, CHAT_ID } = require('../../../constants/validation');

exports.arrayOfObjectWithKeys = function (value, obj = [], allowEmptyArray = false) { // 1st: data (array of objects), 2nd: required data, 3rd: handle null array of data
    // console.log(value);
    if (!Array.isArray(value)) {
        throw new Error('array required');
    } else if (value.length > 0) {
        let errors = [];
        value.map((item) => {
            return obj.filter(k => {
                if (typeof k === 'string') {
                    if (!Object.keys(item).includes(k)) {
                        errors.push(`object must have the following key: ${k}`);
                    }
                } else if (!Object.keys(item).includes(k.index)) {
                    errors.push(`object must have the following key: ${k.index}`);
                } else {
                    let current = item[k.index];
                    let valType = typeof current;
                    if (k.type === 'pk') { // primary key
                        if (!(/^\d+$/.test(current)) || current < 1) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} required`);
                        }
                    } else if (k.type === 'number') {
                        if (!(/^\d+$/.test(current))) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} required`);
                        }
                    } else if (k.type === 'float') {
                        if (!(/^[+-]?([0-9]*[.])?[0-9]+$/.test(current))) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} requried`);
                        }
                    } else if (k.type === 'regex' && k.pattern) {
                        if (!k.pattern.test(current)) {
                            errors.push(`${k.index} has invalid value ${current}, could not match pattern ${k.pattern}`);
                        }
                    } else if (k.type === 'boolean') {
                        if (!(/^(true|false)$/.test(current))) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} requried`);
                        }
                    } else if (k.type === 'isIn' && key === k.index && k.data) {
                        if (!(k.data.includes(item))) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} requried`)
                        }
                    } else if (typeof current !== k.type) {
                        errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} required`);
                    }
                }
            });
        });
        if (errors.length) {
            throw new Error(errors.join())
        } else {
            return true;
        }
    } else {
        if (allowEmptyArray) {
            return true;
        }
        throw new Error('empty array is not allowed');
    }
}

exports.ObjectOfObjectWithKeys = function (value, obj = [], allowEmptyObject = false) { // 1st: data (array of objects), 2nd: required data, 3rd: handle null array of data
    // console.log(value);
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('object required');
    } else if (Object.keys(value).length > 0) {
        let errors = [];
        Object.keys(value).map((key) => {
            let item = value[key];
            return obj.filter(k => {
                if (typeof k === 'string') {
                    if (!Object.keys(item).includes(k)) {
                        errors.push(`object must have the following key: ${k}`);
                    }
                } else if (!Object.keys(item).includes(k.index)) {
                    errors.push(`object must have the following key: ${k.index}`);
                } else {
                    let current = item[k.index];
                    let valType = typeof current;
                    if (k.type === 'pk') { // primary key
                        if (!(/^\d+$/.test(current)) || current < 1) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} required`);
                        }
                    } else if (k.type === 'number') {
                        if (!(/^\d+$/.test(current))) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} required`);
                        }
                    } else if (k.type === 'float') {
                        if (!(/^[+-]?([0-9]*[.])?[0-9]+$/.test(current))) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} requried`);
                        }
                    } else if (k.type === 'regex' && k.pattern) {
                        if (!k.pattern.test(current)) {
                            errors.push(`${k.index} has invalid value ${current}, could not match pattern ${k.pattern}`);
                        }
                    } else if (k.type === 'boolean') {
                        if (!(/^(true|false)$/.test(current))) {
                            errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} requried`);
                        }
                    } else if (k.type === 'isIn' && key === k.index && k.data) {
                        if (!(k.data.includes(item))) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} requried`)
                        }
                    } else if (typeof current !== k.type) {
                        errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} required`);
                    }
                }
            });
        });
        if (errors.length) {
            throw new Error(errors.join())
        } else {
            return true;
        }
    } else {
        if (allowEmptyObject) {
            return true;
        }
        throw new Error('empty object is not allowed');
    }
}

exports.ObjectWithKeys = function (value, data = [], empty = false) {
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('object required');
    } else if (Object.keys(value).length > 0) {
        let errors = [];
        let keys = Object.keys(value);
        keys.map(key => {
            let item = value[key];
            return data.filter(k => {
                if (typeof k === 'string') {
                    if (!keys.includes(k)) {
                        errors.push(`object must have the following key: ${k}`);
                    }
                } else if (!keys.includes(k.index) && !k.notRequired) {
                    errors.push(`object must have the following key: ${k.index}`)
                } else {
                    let type = typeof item;
                    if (k.type === 'pk') { // primary key
                        if (!(/^\d+$/.test(item)) || item < 1) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} required`);
                        }
                    } else if (k.type === 'number' && key === k.index) {
                        if (!(/^\d+$/.test(item))) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} required`);
                        }
                    } else if (k.type === 'float' && key === k.index) {
                        if (!(/^[+-]?([0-9]*[.])?[0-9]+$/.test(item))) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} requried`);
                        }
                    } else if (k.type === 'boolean' && key === k.index) {
                        if (!(/^(true|false)$/.test(item))) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} requried`)
                        }
                    } else if (k.type === 'isIn' && key === k.index && k.data) {
                        if (!(k.data.includes(item))) {
                            errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} requried`)
                        }
                    } else if (k.type === 'regex' && key === k.index && k.pattern) {
                        if (!k.pattern.test(item)) {
                            errors.push(`${k.index} has invalid value ${item}, could not match pattern ${k.pattern}`);
                        }
                    } else if (type !== k.type && key === k.index) {
                        errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} required`);
                    }
                }
            });
        });
        if (errors.length) {
            throw new Error(errors.join());
        } else {
            return true;
        }
    } else if (empty) {
        return true;
    } else {
        throw new Error('empty object not allowed');
    }
}

exports.isObject = function (value, empty = false) {
    return (!Array.isArray(value) && typeof value === 'object' && (empty || Object.keys(value).length > 0));
}

exports.isValidTimeZone = function (tz, nullable = true) {
    // if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    //     throw 'Time zones are not available in this environment';
    // }
    if (nullable && tz === '') return true;

    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    }
    catch (ex) {
        return false;
    }

}

exports.validArrayWithValues = function (value, type = '', pattern = '', empty = false) {
    if (!type) type = 'string';
    if (!pattern) pattern = '';
    if (!Array.isArray(value)) {
        throw new Error('array required');
    } else if (value.length > 0) {
        const errors = [];
        for (key of value) {
            if (type === 'pk') {
                if (!(/^\d+$/.test(key)) || key < 1) {
                    errors.push(`data has invalid value ${key} of type ${typeof key}, ${type} required`);
                }
            } else if (type === 'number') {
                if (!(/^\d+$/.test(key))) {
                    errors.push(`data has invalid value ${key} of type ${typeof key}, ${type} required`);
                }
            } else if (type === 'float') {
                if (!(/^[+-]?([0-9]*[.])?[0-9]+$/.test(key)) || key < 1) {
                    errors.push(`data has invalid value ${key} of type ${typeof key}, ${type} required`);
                }
            } else if (type === 'regex' && pattern != '') {
                let r = new RegExp(pattern);
                if (!r.test(key)) {
                    errors.push(`data has invalid value ${key}, could not match pattern ${pattern}`);
                }
            } else if (k.type === 'boolean') {
                if (!(/^(true|false)$/.test(current))) {
                    errors.push(`${k.index} has invalid value ${current} of type ${valType}, ${k.type} requried`);
                }
            } else if (k.type === 'isIn' && key === k.index && k.data) {
                if (!(k.data.includes(item))) {
                    errors.push(`${k.index} has invalid value ${item} of type ${type}, ${k.type} requried`)
                }
            } else if (typeof key !== type) {
                errors.push(`data has invalid value ${key} of type ${typeof key}, ${type} required`);
            }
        }
        if (errors.length) {
            throw new Error(errors.join());
        } else {
            return true;
        }
    } else {
        if (empty) {
            return true;
        }
        throw new Error('empty array not allowed');
    }
}

exports.validateJSONObject = function (value, cb = null, params = []){
    try {
        let parsed = JSON.parse(value);
        if(typeof cb === 'function'){
            cb(parsed, params);
        }
        return true;
    } catch (err){
        throw new Error(err);
    }
}