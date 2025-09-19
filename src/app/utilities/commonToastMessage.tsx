import "react-toastify/dist/ReactToastify.css";

import { Id, toast, ToastOptions, UpdateOptions } from "react-toastify";

export const toastMessageSuccess = (message: string, props?: ToastOptions) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...props,
  });
};
export const toastMessageError = (message: string, props?: ToastOptions) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...props,
  });
};

export const toastMessageInfo = (message: string, props?: ToastOptions) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...props,
  });
};

export const toastMessageLoad = (message: string, props?: ToastOptions) => {
  return toast.loading(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...props,
  });
};

export const toastMessageUpdate = (toastId: Id, props?: UpdateOptions) => {
  toast.update(toastId, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    isLoading: false,
    ...props,
  });
};
