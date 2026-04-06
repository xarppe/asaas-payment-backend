import express from "express";
import cors from "cors";
import { config } from "./config.js";
import routes from "./routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Error]", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.PORT, () => {
  console.log(`[Config] ASAAS Base URL: ${config.ASAAS_BASE_URL}`);
  console.log(`[Config] Port: ${config.PORT}`);
  console.log(`[Config] ASAAS key loaded: ${!!config.ASAAS_API_KEY}`);
  console.log(`✅ ASAAS PIX backend running on port ${config.PORT}`);
});
