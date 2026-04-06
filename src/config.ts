export const config = {
  PORT: parseInt(process.env.PORT || "10000", 10),
  NODE_ENV: process.env.NODE_ENV || "production",
  ASAAS_API_KEY: String(process.env.ASAAS_API_KEY || "").replace(/^\$/, ""),
  ASAAS_BASE_URL: "https://api.asaas.com/v3",
};

if (!config.ASAAS_API_KEY) {
  console.warn("ASAAS_API_KEY environment variable is not set");
}
