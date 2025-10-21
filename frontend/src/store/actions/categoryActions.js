import {
  getCategories as apiGetCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from "../../modules/Category/actions";

/* Plain action type names used by your reducer */
export const FETCH_CATEGORIES = "FETCH_CATEGORIES";
export const ADD_CATEGORY = "ADD_CATEGORY";
export const UPDATE_CATEGORY = "UPDATE_CATEGORY";
export const REMOVE_CATEGORY = "REMOVE_CATEGORY";

/* Plain action creators (for reducer) */
const fetchCategoriesAction = (categories) => ({
  type: FETCH_CATEGORIES,
  payload: { categories },
});
const addCategoryAction = (category) => ({
  type: ADD_CATEGORY,
  payload: { category },
});
const updateCategoryAction = (category) => ({
  type: UPDATE_CATEGORY,
  payload: { category },
});
const removeCategoryAction = (categoryId) => ({
  type: REMOVE_CATEGORY,
  payload: { categoryId },
});

/* Thunks (async) */

/* fetchCategories({ skip, limit }): fetch and dispatch */
export const fetchCategories = ({ skip = 0, limit = 50 } = {}) => {
  return async (dispatch) => {
    try {
      const res = await apiGetCategories({ skip, limit });
      // your API returns { results, total, count } per earlier messages
      const rows = res?.results ?? res;
      dispatch(fetchCategoriesAction(rows || []));
      return rows;
    } catch (err) {
      console.error("fetchCategories error:", err);
      throw err;
    }
  };
};

/* createCategory(payload): create on API and dispatch to store */
export const createCategory = (payload) => {
  return async (dispatch) => {
    try {
      const res = await apiCreateCategory(payload);
      dispatch(addCategoryAction(res));
      return res;
    } catch (err) {
      console.error("createCategory error:", err);
      throw err;
    }
  };
};

/* editCategory(id, payload) */
export const editCategory = (id, payload) => {
  return async (dispatch) => {
    try {
      const res = await apiUpdateCategory(id, payload);
      dispatch(updateCategoryAction(res));
      return res;
    } catch (err) {
      console.error("editCategory error:", err);
      throw err;
    }
  };
};

/* removeCategory(id) */
export const removeCategory = (id) => {
  return async (dispatch) => {
    try {
      await apiDeleteCategory(id);
      dispatch(removeCategoryAction(id));
      return id;
    } catch (err) {
      console.error("removeCategory error:", err);
      throw err;
    }
  };
};
