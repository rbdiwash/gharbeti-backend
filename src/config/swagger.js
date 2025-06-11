const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gharbeti API Documentation",
      version: "1.0.0",
      description: "API documentation for Gharbeti Backend",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
      {
        url: "https://gharbeti-backend.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        LeaseAgreement: {
          type: "object",
          required: ["landlordId", "agreementPoints"],
          properties: {
            landlordId: {
              type: "string",
              description: "The ID of the landlord",
            },
            agreementPoints: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of agreement points",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
