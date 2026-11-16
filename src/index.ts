import dns from "node:dns";
import dotenv from "dotenv";

// Set default DNS resolution to prioritize IPv4 and use Google DNS
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

import app from "./app";

// Railway injects PORT; fall back to API_PORT for local dev
const PORT = process.env.PORT || process.env.API_PORT || 3000;

app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});