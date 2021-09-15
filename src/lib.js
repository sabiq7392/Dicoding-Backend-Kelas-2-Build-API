/* eslint-disable arrow-body-style */
require('regenerator-runtime');

const isString = (element) => {
  return typeof element === 'string';
};

const isNumber = (element) => {
  return typeof element === 'number';
};

const isBoolean = (element) => {
  return typeof element === 'boolean';
};

module.exports = { isString, isNumber, isBoolean };
