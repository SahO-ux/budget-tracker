import API from "../../api";

const loginUser = async ({ email, password }) => {
  const res = await API.post("/user/login", { email, password });
  return res.data; // { token, user }
};

const getUserInfo = async () => {
  const res = await API.get("/user/user-info");
  return res.data;
};

export { loginUser, getUserInfo };
