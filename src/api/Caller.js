const accessTokenKey = 'Buidler_access_token';
const apiBaseUrl = 'https://staging.api.buidler.app/';

const METHOD_GET = 'get';
const METHOD_POST = 'post';
const METHOD_PUT = 'put';
const METHOD_DELETE = 'delete';
const METHOD_PATCH = 'patch';

async function requestAPI(method, uri, body, serviceBaseUrl, controller, h) {
  let apiUrl = '';
  if (serviceBaseUrl) {
    apiUrl = serviceBaseUrl + uri;
  } else {
    apiUrl = apiBaseUrl + uri;
  }
  // Build API header
  let headers = {
    Accept: '*/*',
    'Access-Control-Allow-Origin': '*',
  };
  if (body instanceof FormData) {
    // headers['Content-Type'] = 'multipart/form-data';
    // headers = {};
  } else {
    headers['Content-Type'] = 'application/json';
  }

  // Get access token and attach it to API request's header
  try {
    const storage = await chrome.storage.local.get(accessTokenKey);
    const accessToken = storage[accessTokenKey];
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.log('No token is stored');
    }
  } catch (e) {
    console.log(e);
  }

  if (h) {
    headers = {
      ...headers,
      ...h,
    };
  }

  // Build API body
  let contentBody = null;
  if (
    method.toLowerCase() === METHOD_POST ||
    method.toLowerCase() === METHOD_PUT ||
    method.toLowerCase() === METHOD_DELETE ||
    method.toLowerCase() === METHOD_PATCH
  ) {
    if (body) {
      if (body instanceof FormData) {
        contentBody = body;
      } else {
        contentBody = JSON.stringify(body);
      }
    }
  }
  // Construct fetch options
  const fetchOptions = { method, headers, body: contentBody };
  if (!!controller) {
    fetchOptions.signal = controller.signal;
  }
  return fetch(apiUrl, fetchOptions)
    .then((res) => {
      return res
        .json()
        .then(async (data) => {
          if (res.status !== 200) {
            // error
            return { ...data, statusCode: res.status };
          }
          if (data.data) {
            return { ...data, statusCode: res.status };
          }
          if (data.success || data.message) {
            return {
              data: data.data,
              success: data.success,
              message: data.message,
              statusCode: res.status,
            };
          }
          return { data, statusCode: res.status };
        })
        .catch((err) => {
          return { message: err, statusCode: res.status };
        });
    })
    .catch(async (err) => {
      const msg = err.message || err || '';
      return {
        message: msg,
      };
    });
}

const Caller = {
  get(url, baseUrl, controller, headers) {
    return requestAPI(METHOD_GET, url, undefined, baseUrl, controller, headers);
  },

  post(url, data, baseUrl, controller, h) {
    return requestAPI(METHOD_POST, url, data, baseUrl, controller, h);
  },

  patch(url, data, baseUrl, controller) {
    return requestAPI(METHOD_PATCH, url, data, baseUrl, controller);
  },

  put(url, data, baseUrl, controller) {
    return requestAPI(METHOD_PUT, url, data, baseUrl, controller);
  },

  delete(url, data, baseUrl, controller) {
    return requestAPI(METHOD_DELETE, url, data, baseUrl, controller);
  },
};

export default Caller;
