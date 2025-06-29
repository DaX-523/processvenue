import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

// Load OpenAPI spec from YAML file
const swaggerDocument = YAML.load(
  path.join(__dirname, "../../docs/swagger.yaml")
);

// Swagger JSDoc options (for future JSDoc integration if needed)
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book Review API",
      version: "1.0.0",
      description: "A simple API for managing books and their reviews",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

// Generate swagger specification
const specs = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
  customSiteTitle: "Book Review API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export { swaggerDocument, swaggerUi, swaggerUiOptions, specs };
