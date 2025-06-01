export const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const API_ROUTES = {
  SIGN_UP: {
    url: `${API_URL}/auth/register`,
    method: "POST",
  },
  SIGN_IN: {
    url: `${API_URL}/auth/login`,
    method: "POST",
  },
};
