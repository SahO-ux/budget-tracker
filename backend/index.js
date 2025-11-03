import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import connectDB from "./mongoDB/connect.js";
import { loadModules } from "./server/modules-loader.js";
import swaggerSpec from "./server/swagger.js";

// -------------------- Setup --------------------
dotenv.config({ quiet: true });
const app = express();

// -------------------- Middleware --------------------
function setupMiddleware(app) {
  app.use(express.json());
  app.use(express.urlencoded({ limit: "30mb", extended: true }));
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
  app.use(morgan("dev"));
  app.use(cors());
}
setupMiddleware(app);

// mount swagger UI before modules so docs include expected paths
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- Health Test Route --------------------
app.get("/", (req, res) => res.json("Hello AWS from Budget Tracker"));

// -------------------- Server Startup --------------------
const startServer = async () => {
  try {
    // 1️⃣ Connect DB
    await connectDB();

    // 2️⃣ Load all modules (models + controllers + services + routes)
    await loadModules(app);

    // 3️⃣ Start server
    const PORT = process.env.PORT || 8081;
    const HOST = "0.0.0.0";

    app.listen(PORT, HOST, () =>
      console.log(`🚀 SERVER LISTENING AT http://${HOST}:${PORT} 🚀`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
