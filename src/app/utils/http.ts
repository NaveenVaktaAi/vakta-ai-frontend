import axios, { AxiosResponse } from "axios";


import { withData, withError } from "./api";
import { toastMessageError } from "../utilities/commonToastMessage";



let isUnauthorizedToastDisplayed = false;

export const http = axios.create({
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(async (req: any) => {
  const session = localStorage.getItem("__ATK__");
  if (session && req.headers) req.headers.authorization = `Bearer ${session}`;
  return req;
});

http.interceptors.response.use(
  (res) => {
    return withData(res.data) as AxiosResponse<any>;
  },
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.detail?.error;

    if (status === 401 && message === "Invalid token") {
      if (!isUnauthorizedToastDisplayed) {
        isUnauthorizedToastDisplayed = true;

        toastMessageError(
          "Your session has expired. Please log in again to continue.",
          { toastId: message },
        );

        setTimeout(() => {
          const rememberMeData = localStorage.getItem("x-remember-agent");
          if (rememberMeData) {
            localStorage.clear();
            localStorage.setItem("x-remember-agent", rememberMeData);
          } else {
            localStorage.clear();
          }

          window.location.href = "/login"; // Redirect to login page
          isUnauthorizedToastDisplayed = false; // Reset the flag after redirect
        }, 1000);
      }
    }
    return Promise.reject(withError(err.response?.data));
  },
);

// http.interceptors.response.use(
//   (res: AxiosResponse<any>) => {
//     console.log("Raw Response:", res.data); // Debug raw response
//     // Preserve the original AxiosResponse structure
//     return {
//       // ...res, // Return the original AxiosResponse
//       data: withData(res.data), // Transform the `data` property only
//     };
//   },
//   (err) => {
//     console.error("Raw Error:", err.response?.data); // Debug raw error
//     // Reject with transformed error
//     return Promise.reject(withError(err.response?.data || err));
//   },
// );

export function get<P>(url: string, params?: P): Promise<any> {
  return http({
    method: "get",
    url,
    params,
  });
}

export function post<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "post",
    url,
    data,
    params,
  });
}

export function postFile<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    url,
    data,
    params,
  });
}

export function put<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "put",
    url,
    data,
    params,
  });
}

export function patch<D, P>(url: string, data: D, params?: P): any {
  return http({
    method: "patch",
    url,
    data,
    params,
  });
}

export function remove<P>(url: string, params?: P): any {
  return http({
    method: "delete",
    url,
    params,
  });
}
