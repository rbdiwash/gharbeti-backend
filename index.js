const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const noticeRoutes = require("./src/routes/notices");
const userRoutes = require("./src/routes/user");
const notificatonRoutes = require("./src/routes/notifications");
const maintenanceRoutes = require("./src/routes/maintenance");
const leaseAgreementRoutes = require("./src/routes/leaseAgreement");
const messageRoutes = require("./src/routes/messages");
const tenantRoutes = require("./src/routes/tenants");
const profileRoutes = require("./src/routes/profile");
const propertyRoutes = require("./src/routes/property");
const paymentRoutes = require("./src/routes/payments");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./src/config/swagger");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificatonRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/lease-agreements", leaseAgreementRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
