import { TransactionAndCategoryTypeEnums } from "./lib/global-constants.js";

/**
 * Swagger / OpenAPI spec
 *
 * Note:
 * - servers.url is driven by process.env.SWAGGER_SERVER_URL (keep it set in your env)
 */

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Budget Tracker API",
    version: "1.0.0",
    description:
      "API documentation for Personal Budget Tracker (User, Categories, Transactions, Budgets & Analytics modules).",
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || "http://localhost:8081",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      // --- User schemas ---
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "604c1f8f2f1b2a0012345678" },
          name: { type: "string", example: "Sahil" },
          email: { type: "string", example: "test@example.com" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      UserRegister: {
        type: "object",
        properties: {
          name: { type: "string", example: "Sahil" },
          email: { type: "string", example: "sahil@example.com" },
          password: { type: "string", example: "password" },
        },
        required: ["name", "email", "password"],
      },

      UserLogin: {
        type: "object",
        properties: {
          email: { type: "string", example: "test@example.com" },
          password: { type: "string", example: "password" },
        },
        required: ["email", "password"],
      },

      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJI..." },
          user: { $ref: "#/components/schemas/User" },
        },
      },

      // --- Category schemas ---
      Category: {
        type: "object",
        properties: {
          _id: { type: "string", example: "604c2a8f2f1b2a001234abcd" },
          user: { type: "string", example: "604c1f8f2f1b2a0012345678" },
          name: { type: "string", example: "Groceries" },
          type: {
            type: "string",
            description: "Category type",
            enum: Object.values(
              TransactionAndCategoryTypeEnums || {
                income: "income",
                expense: "expense",
              }
            ),
            example: "expense",
          },
          color: { type: "string", example: "#f97316" },
          isDeleted: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      // Pagination wrappers
      PaginatedCategories: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
          total: { type: "integer", example: 42 },
        },
      },

      // Generic simple id response
      CreatedIdResponse: {
        type: "object",
        properties: {
          _id: { type: "string" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },

    // global security default (left empty here; applied per operation where needed)
  },

  security: [],
};

/**
 * Paths: Only User and Category endpoints included
 */
const paths = {
  // ----- User routes -----
  "/user/register": {
    post: {
      tags: ["User"],
      summary: "Register a new user (creates default categories as well)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserRegister" },
          },
        },
      },
      responses: {
        201: {
          description: "User created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatedIdResponse" },
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/user/login": {
    post: {
      tags: ["User"],
      summary: "Login and receive JWT + user info",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserLogin" },
          },
        },
      },
      responses: {
        200: {
          description: "Authenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        400: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/user/user-info": {
    get: {
      tags: ["User"],
      summary: "Get current authenticated user's info",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Current user",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        401: {
          description: "Unauthenticated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  // ----- Category routes -----
  "/category": {
    post: {
      tags: ["Category"],
      summary: "Create a category for authenticated user",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Groceries" },
                type: {
                  type: "string",
                  enum: Object.values(
                    TransactionAndCategoryTypeEnums || {
                      income: "income",
                      expense: "expense",
                    }
                  ),
                  example: "expense",
                },
                color: { type: "string", example: "#f97316" },
              },
              required: ["name", "type"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Category created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        400: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: { description: "Unauthenticated" },
      },
    },

    get: {
      tags: ["Category"],
      summary:
        "List categories (paged + optional filters). Returns user's categories.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "skip", in: "query", schema: { type: "integer", default: 0 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 50 },
        },
        {
          name: "name",
          in: "query",
          schema: { type: "string" },
          description: "Filter by name (partial, case-insensitive)",
        },
        {
          name: "type",
          in: "query",
          schema: {
            type: "string",
            enum: Object.values(
              TransactionAndCategoryTypeEnums || {
                income: "income",
                expense: "expense",
              }
            ),
          },
          description: "Filter by category type",
        },
      ],
      responses: {
        200: {
          description: "Paged categories",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedCategories" },
            },
          },
        },
        401: { description: "Unauthenticated" },
      },
    },
  },

  "/category/{id}": {
    get: {
      tags: ["Category"],
      summary: "Get a category by id (belongs to auth user)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ObjectId",
        },
      ],
      responses: {
        200: {
          description: "Category",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        401: { description: "Unauthenticated" },
        404: {
          description: "Not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },

    patch: {
      tags: ["Category"],
      summary: "Update a category (partial/fields) for authenticated user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ObjectId",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Groceries" },
                type: {
                  type: "string",
                  enum: Object.values(
                    TransactionAndCategoryTypeEnums || {
                      income: "income",
                      expense: "expense",
                    }
                  ),
                },
                color: { type: "string", example: "#f97316" },
              },
              required: ["name", "type"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Updated category",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        400: { description: "Invalid request" },
        401: { description: "Unauthenticated" },
        404: { description: "Not found" },
      },
    },

    delete: {
      tags: ["Category"],
      summary: "Soft-delete a category for authenticated user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ObjectId",
        },
      ],
      responses: {
        200: { description: "Deleted" },
        401: { description: "Unauthenticated" },
        404: { description: "Not found" },
      },
    },
  },

  // -------------------- TRANSACTION MODULE --------------------
  "/transaction": {
    post: {
      summary: "Create a transaction",
      tags: ["Transaction"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateTransactionInput" },
          },
        },
      },
      responses: { 201: { description: "Transaction created" } },
    },
    get: {
      summary: "Get all transactions",
      tags: ["Transaction"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "skip", in: "query", schema: { type: "integer", default: 0 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
        },
        { name: "category", in: "query", schema: { type: "string" } },
        { name: "type", in: "query", schema: { type: "string" } },
        { name: "minAmount", in: "query", schema: { type: "number" } },
        { name: "maxAmount", in: "query", schema: { type: "number" } },
        {
          name: "startDate",
          in: "query",
          schema: { type: "string", format: "date" },
        },
        {
          name: "endDate",
          in: "query",
          schema: { type: "string", format: "date" },
        },
        { name: "sortBy", in: "query", schema: { type: "string" } },
        { name: "sortDir", in: "query", schema: { type: "string" } },
      ],
      responses: { 200: { description: "Transactions fetched" } },
    },
  },
  "/transaction/{id}": {
    get: {
      summary: "Get transaction by ID",
      tags: ["Transaction"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: { 200: { description: "Transaction fetched" } },
    },
    patch: {
      summary: "Update transaction",
      tags: ["Transaction"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                amount: {
                  type: "number",
                  minimum: 0,
                  example: 1000,
                },
                type: {
                  type: "string",
                  enum: Object.values(
                    TransactionAndCategoryTypeEnums || {
                      income: "income",
                      expense: "expense",
                    }
                  ),
                },
                category: {
                  type: "string",
                  example: "68f7cca4be758621fa5d4634",
                },
                note: {
                  type: "string",
                  example: "Grocery shopping done at DMART",
                },
              },
              required: ["name", "type"],
            },
          },
        },
      },
      responses: { 200: { description: "Transaction updated" } },
    },
    delete: {
      summary: "Delete transaction",
      tags: ["Transaction"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: { 200: { description: "Transaction deleted" } },
    },
  },

  "/budget": {
    post: {
      tags: ["Budget"],
      summary: "Set or update budget for a month",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["month", "amount"],
              properties: {
                month: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}$",
                  example: "2025-10",
                  description: "Month in YYYY-MM format",
                },
                amount: {
                  type: "number",
                  minimum: 0,
                  example: 10000,
                  description: "Budget amount for the month",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Budget set or updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  user: { type: "string" },
                  month: { type: "string" },
                  amount: { type: "number" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
            },
          },
        },
        400: { description: "Missing or invalid parameters" },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
    get: {
      tags: ["Budget"],
      summary: "List all budgets for the authenticated user",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "skip",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 0, default: 0 },
          description: "Number of documents to skip",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, maximum: 20, default: 20 },
          description: "Number of budgets to return",
        },
      ],
      responses: {
        200: {
          description: "List of budgets",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: { type: "string" },
                        month: { type: "string" },
                        amount: { type: "number" },
                        user: { type: "string" },
                        createdAt: { type: "string" },
                        updatedAt: { type: "string" },
                      },
                    },
                  },
                  total: { type: "integer" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Internal server error" },
      },
    },
  },
  "/budget/{month}": {
    get: {
      tags: ["Budget"],
      summary: "Get budget summary for a specific month",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "month",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}$",
            example: "2025-10",
          },
          description: "Month in YYYY-MM format",
        },
      ],
      responses: {
        200: {
          description: "Budget summary for the given month",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  budget: { type: "number", example: 10000 },
                  spent: { type: "number", example: 7500 },
                  income: { type: "number", example: 12000 },
                  month: { type: "string", example: "2025-10" },
                },
              },
            },
          },
        },
        400: { description: "Missing or invalid month parameter" },
        401: { description: "Unauthorized" },
        404: { description: "Budget not found" },
        500: { description: "Internal server error" },
      },
    },
  },

  "/analytics": {
    get: {
      tags: ["Analytics"],
      summary: "Get analytics data for the authenticated user",
      description:
        "Returns summarized transaction analytics grouped by category and month for the logged-in user.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Analytics data retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      categorySummary: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            categoryId: {
                              type: "string",
                              example: "652a09b3fa41b8c06a8e3a23",
                            },
                            categoryName: {
                              type: "string",
                              example: "Food & Dining",
                            },
                            type: {
                              type: "string",
                              enum: Object.values(
                                TransactionAndCategoryTypeEnums || {
                                  income: "income",
                                  expense: "expense",
                                }
                              ),
                              example: "expense",
                            },
                            totalAmount: { type: "number", example: 5400 },
                          },
                        },
                      },
                      monthlySummary: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            year: { type: "integer", example: 2025 },
                            month: { type: "integer", example: 10 },
                            type: {
                              type: "string",
                              enum: Object.values(
                                TransactionAndCategoryTypeEnums || {
                                  income: "income",
                                  expense: "expense",
                                }
                              ),
                              example: "income",
                            },
                            totalAmount: { type: "number", example: 12000 },
                            monthKey: {
                              type: "string",
                              example: "2025-10",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Missing or invalid userId",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "userId is required" },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Internal server error" },
                },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerSpec = {
  ...swaggerDefinition,
  paths,
};

export default swaggerSpec;
