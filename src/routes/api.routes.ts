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
  GEMINI_API: {
    url: `${API_URL}/api/gemini/chat`,
    method: "POST",
  },
  /* ROOMS */
  CREATE_ROOM_USER: {
    url: `${API_URL}/sala`,
    method: "POST",
  },
  GET_ROOMS_USER: {
    url: `${API_URL}/sala`,
    method: "GET",
  },
  GET_ROOM_BY_ID: {
    url: `${API_URL}/sala`,
    method: "GET",
  },
  UPDATE_ROOM: {
    url: `${API_URL}/sala`,
    method: "PUT",
  },
};
