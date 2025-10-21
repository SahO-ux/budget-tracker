const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    return null;
  }
};

const storeUserInLocalStorage = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

const removeStoredUser = () => {
  localStorage.removeItem("user");
};

const getStoredToken = () => {
  return localStorage.getItem("token");
};

const storeTokenInLocalStorage = (token) => {
  localStorage.setItem("token", token);
};

const removeStoredToken = () => {
  localStorage.removeItem("token");
};

export {
  getStoredUser,
  storeUserInLocalStorage,
  removeStoredUser,
  getStoredToken,
  storeTokenInLocalStorage,
  removeStoredToken,
};
