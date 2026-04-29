import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "healthy" });
});

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  const port = config.port;
  app.listen(port, () => {
    console.log(`Server running on port ${port} in ${config.env} mode`);
  });
}

export default app;
