const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParse = require("cookie-parser");
const fileUpload = require("express-fileupload");

// for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie and file middleware
app.use(cookieParse());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

// temp check
app.set("view engine", "ejs");

// morgan middleware
app.use(morgan("tiny"));

// import all the routed
const home = require("./route/home");
const user = require("./route/user");
const product = require("./route/product");
const payment = require("./route/payment");
const order = require("./route/order");
// router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", payment);
app.use("/api/v1", order);

app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});
// exporting app js
module.exports = app;
