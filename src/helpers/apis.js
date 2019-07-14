import applyConverters from 'axios-case-converter';
import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const token = cookies.get('token');

export const request = applyConverters(
  axios.create({
    baseURL: env.API_ENDPOINT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
);

export const authRequest = applyConverters(
  axios.create({
    baseURL: env.API_ENDPOINT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    }
  })
);

export const toCamelCase = (str) => {
  return str.replace(/([\:\-\_]+(.))/g, (_, separator, letter, offset) => {
    return offset ? letter.toUpperCase() : letter;
  });
};

export const toCamelCaseDict = (dict) => {
  const isNull = (n) => {
    return n === null;
  };

  const isArray = (a) => {
    return Array.isArray(a);
  };

  const isObject = (o) => {
    return typeof o === 'object' && !isNull(o) && !isArray(o);
  };

  const ret = {};

  for (const prop in dict) {
    if (dict.hasOwnProperty(prop)) {
      ret[toCamelCase(prop)] = dict[prop];
      if (isObject(dict[prop])) {
        ret[toCamelCase(prop)] = toCamelCaseDict(dict[prop]);
      } else if (isArray(dict[prop])) {
        ret[toCamelCase(prop)] = ret[toCamelCase(prop)].map((i) => {
          return toCamelCaseDict(i);
        });
      }
    }
  }
  return ret;
};

export const checkStatus = async (response) => {
  const data = await response.clone().json();
  if (!response.ok) {
    return response
      .clone()
      .json()
      .then((err, resp) => {
        console.log(err);
        console.log(resp);
        console.log(response);
        Promise.reject(toCamelCaseDict(err));
      });
  }
  return toCamelCaseDict(data);
};