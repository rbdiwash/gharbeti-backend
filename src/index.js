const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noticeRoutes = require("./routes/notices");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notifications");
const maintenanceRoutes = require("./routes/maintenance");
const leaseAgreementRoutes = require("./routes/leaseAgreement");
const messageRoutes = require("./routes/messages");
const tenantRoutes = require("./routes/tenants");
const profileRoutes = require("./routes/profile");
const propertyRoutes = require("./routes/property");
const paymentRoutes = require("./routes/payments");
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
app.use("/api/notifications", notificationRoutes);
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
  console.log("Server running on 0.0.0.0:5000");
});
