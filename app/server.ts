/**  @format */

import express, { Express } from "express";
import bodyParser from "body-parser";

import orderRoutes from "./routes/order";

const app: Express = express();
app.use(bodyParser.json());

/**
 * Routes
 */
app.use("/", orderRoutes);

/**
 * PORT
 */
const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => console.log(`🎉 Airship running on port: ${PORT}`));
