import { TransactionAndCategoryTypeEnums } from "./lib/global-constants.js";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Budget Tracker API",
    version: "1.0.0",
    description:
      "API documentation for Personal Budget Tracker (Auth, Categories, Transactions, Budgets).",
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL,
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
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
        },
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
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["income", "expense"] },
          color: { type: "string" },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["income", "expense"] },
          category: { $ref: "#/components/schemas/Category" },
          note: { type: "string" },
          date: { type: "string" },
          createdAt: { type: "string" },
        },
      },
      Budget: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          month: { type: "string", example: "2025-10" },
          amount: { type: "number" },
          createdAt: { type: "string" },
        },
      },
      PaginatedCategories: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
          total: { type: "number" },
        },
      },
      PaginatedTransactions: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: { $ref: "#/components/schemas/Transaction" },
          },
          count: { type: "number" },
          total: { type: "number" },
        },
      },
    },
  },
  security: [],
};

const paths = {
  "/user/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a test user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserLogin" },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { _id: { type: "string" } },
              },
            },
          },
        },
        400: { description: "Bad request" },
      },
    },
  },
  "/user/login": {
    post: {
      tags: ["Auth"],
      summary: "Login and get JWT token",
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
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthResponse" },
            },
          },
        },
        400: { description: "Invalid credentials" },
      },
    },
  },
  "/user/user-info": {
    get: {
      tags: ["Auth"],
      summary: "Get current user info",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/category": {
    post: {
      tags: ["Categories"],
      summary: "Create category",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: {
                  type: "string",
                  enum: Object.values(TransactionAndCategoryTypeEnums),
                },
                color: { type: "string" },
              },
              required: ["name", "type"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { _id: { type: "string" } },
              },
            },
          },
        },
      },
    },
    get: {
      tags: ["Categories"],
      summary: "List categories (paged)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "skip", in: "query", schema: { type: "integer", default: 0 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 50 },
        },
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedCategories" },
            },
          },
        },
      },
    },
  },

  "/category/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Get category by id",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
      },
    },
    patch: {
      tags: ["Categories"],
      summary: "Update category (partial)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Category" },
          },
        },
      },
      responses: { 200: { description: "OK" } },
    },
    delete: {
      tags: ["Categories"],
      summary: "Delete category",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: { 200: { description: "Deleted" } },
    },
  },

  "/transaction": {
    post: {
      tags: ["Transactions"],
      summary: "Create transaction",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Transaction" },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { _id: { type: "string" } },
              },
            },
          },
        },
      },
    },
    get: {
      tags: ["Transactions"],
      summary: "List transactions (filters + pagination)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "skip", in: "query", schema: { type: "integer", default: 0 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
        },
        { name: "cursor", in: "query", schema: { type: "string" } },
        { name: "category", in: "query", schema: { type: "string" } },
        {
          name: "type",
          in: "query",
          schema: { type: "string", enum: ["income", "expense"] },
        },
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
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedTransactions" },
            },
          },
        },
      },
    },
  },

  "/transaction/{id}": {
    get: {
      tags: ["Transactions"],
      summary: "Get transaction",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Transaction" },
            },
          },
        },
      },
    },
    patch: {
      tags: ["Transactions"],
      summary: "Update transaction (partial)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Transaction" },
          },
        },
      },
      responses: { 200: { description: "OK" } },
    },
    delete: {
      tags: ["Transactions"],
      summary: "Delete transaction",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: { 200: { description: "Deleted" } },
    },
  },

  "/budget": {
    post: {
      tags: ["Budgets"],
      summary: "Set or update budget for a month",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                month: { type: "string" },
                amount: { type: "number" },
              },
              required: ["month", "amount"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Budget" },
            },
          },
        },
      },
    },
    get: {
      tags: ["Budgets"],
      summary: "List budgets (paged)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "skip", in: "query", schema: { type: "integer", default: 0 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
        },
      ],
      responses: { 200: { description: "OK" } },
    },
  },

  "/budget/{month}": {
    get: {
      tags: ["Budgets"],
      summary: "Get budget for a month (plus spent)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "month",
          in: "path",
          required: true,
          schema: { type: "string", example: "2025-10" },
        },
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  budget: { type: "number" },
                  spent: { type: "number" },
                  month: { type: "string" },
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
