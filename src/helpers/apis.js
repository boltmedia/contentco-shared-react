import applyConverters from 'axios-case-converter';
import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const token = cookies.get('admin_token');

export const CancelToken = axios.CancelToken;
export const request = applyConverters(
  axios.create({
    baseURL: process.env.API_ENDPOINT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
);

export const authRequest = applyConverters(
  axios.create({
    baseURL: process.env.API_ENDPOINT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    }
  })
);

export const authReqNoIntercept = applyConverters(
  axios.create({
    baseURL: process.env.API_ENDPOINT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    }
  })
);

export const baseAuthRequest = axios.create({
  baseURL: process.env.API_ENDPOINT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`
  }
});

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

const interceptorErrorHandler = (error, requestCallback) => {
  let errMessage;
  if (error && error.nonFieldErrors && error.nonFieldErrors.length) {
    errMessage = error.nonFieldErrors.join(' ');
    requestCallback(errMessage);
  } else {
    const errorResponse =
      (error.response && (error.response.data || error.response.statusText)) ||
      error ||
      '';
    const errValues =
      typeof errorResponse === 'string'
        ? false
        : Object.entries(errorResponse) || [];
    if (errValues && errValues.length) {
      errMessage = errValues
        .map((item) => {
          return `${(item[0][0] || '').toUpperCase()}${item[0].slice(1)}: ${
            item[1]
          }`;
        })
        .join(' ');
      requestCallback(errMessage);
    } else {
      requestCallback(
        (errorResponse && errorResponse.toString()) || 'Something went wrong!'
      );
    }
  }
};

export const configAxiosErrorInterceptor = (requestCallback) => {
  const arrRequest = [request, authRequest, baseAuthRequest];
  arrRequest.forEach((req) => {
    req.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (!axios.isCancel(error)) {
          interceptorErrorHandler(error, requestCallback);
        }
        return Promise.reject(error);
      }
    );
  });
};
