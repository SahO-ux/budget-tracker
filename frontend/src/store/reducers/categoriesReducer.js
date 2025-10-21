import { TransactionTypeEnums } from "../../utils/global-constants";

const initialCategoriesState = {
  expenseCategories: [],
  incomeCategories: [],
  allCategories: [],
};

const categoriesReducer = (state = initialCategoriesState, action) => {
  switch (action.type) {
    case "FETCH_CATEGORIES": {
      const { categories } = action.payload;
      const expenseCategories = categories.filter(
        (val) => val.type === TransactionTypeEnums.EXPENSE
      );
      const incomeCategories = categories.filter(
        (val) => val.type === TransactionTypeEnums.INCOME
      );
      return { expenseCategories, incomeCategories, allCategories: categories };
    }

    case "ADD_CATEGORY": {
      const { category } = action.payload;

      const keyToUpdate =
        category.type === TransactionTypeEnums.INCOME
          ? "incomeCategories"
          : "expenseCategories";

      return {
        ...state,
        [keyToUpdate]: [...state[keyToUpdate], category],
        allCategories: [...state.allCategories, category],
      };
    }

    case "UPDATE_CATEGORY": {
      const { category } = action.payload;

      const keyToUpdate =
        category.type === TransactionTypeEnums.INCOME
          ? "incomeCategories"
          : "expenseCategories";

      return {
        ...state,
        [keyToUpdate]: state[keyToUpdate].map((c) =>
          c._id === category._id ? category : c
        ),
        allCategories: state.allCategories.map((c) =>
          c._id === category._id ? category : c
        ),
      };
    }

    case "REMOVE_CATEGORY": {
      const { categoryId } = action.payload;

      // Find the category type first so we know which array to update
      const categoryToRemove = state.allCategories.find(
        (c) => c._id === categoryId
      );

      if (!categoryToRemove) return state; // if not found, no state change

      const keyToUpdate =
        categoryToRemove.type === TransactionTypeEnums.INCOME
          ? "incomeCategories"
          : "expenseCategories";

      return {
        ...state,
        [keyToUpdate]: state[keyToUpdate].filter((c) => c._id !== categoryId),
        allCategories: state.allCategories.filter((c) => c._id !== categoryId),
      };
    }

    default:
      return state;
  }
};

export default categoriesReducer;
