export const environment = {
  production: false,
  apiHost: (window as any)["env"]?.API_HOST || "http://localhost:3000"
};
