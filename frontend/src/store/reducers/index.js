import { combineReducers } from "redux";

import categoriesReducer from "./categoriesReducer";

const appReducers = combineReducers({
  categoriesReducer,
});

const rootReducer = (state, action) => {
  return appReducers(state, action);
};

export default rootReducer;
