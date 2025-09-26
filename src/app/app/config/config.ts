// const config = {
//   baseUrl: import.meta.env.VITE_BASE_URL,
//   apiUrl: import.meta.env.VITE_BACKEND_URL,
//   parentUrl: import.meta.env.VITE_PARENT_URL,
//   parentHostName: import.meta.env.VITE_PARENT_HOSTNAME,
//   rememberMeKey: import.meta.env.VITE_APP_REMEMBERED_KEY,
// };

// export default config;

const config = {
  baseUrl: process.env.VITE_BASE_URL ,
  apiUrl: process.env.VITE_BACKEND_URL ,
  parentUrl: process.env.VITE_PARENT_URL ,
  parentHostName: process.env.VITE_PARENT_HOSTNAME ,
  rememberMeKey: process.env.VITE_APP_REMEMBERED_KEY ,
};

export default config;
