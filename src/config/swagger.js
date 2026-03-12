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
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://gharbeti-backend.onrender.com",
        description: "Production server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication and password reset" },
      { name: "Notices", description: "Notice management" },
      { name: "Users", description: "User and tenant listing" },
      { name: "Notifications", description: "In-app notifications" },
      { name: "Maintenance", description: "Maintenance requests" },
      { name: "Lease Agreements", description: "Lease agreement management" },
      { name: "Messages", description: "Chat messages" },
      { name: "Tenants", description: "Tenant invite and management" },
      { name: "Profile", description: "User profile" },
      { name: "Properties", description: "Property management" },
      { name: "Payments", description: "Payment and rent" },
      { name: "Buzz", description: "Landlord buzz (reminders)" },
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
              items: { type: "string" },
              description: "Array of agreement points",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/routes/**/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
