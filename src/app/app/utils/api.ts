import ApiResponse, { TApiState } from "../resources/IApiResponse";


const { toString } = Object.prototype;

export const isObject = <T>(arg: T): boolean =>
  toString.call(arg) === "[object Object]";

export const withError = <T extends TApiState>(arg: T): ApiResponse => {
  if (isObject(arg)) {
    return {
      data: null,
      error: {
        ...arg,
      },
    };
  }

  return {
    data: null,
    error: {
      message: arg,
    },
  };
};

export const withData = <T extends TApiState>(data: T): ApiResponse => ({
  error: null,
  data,
});
