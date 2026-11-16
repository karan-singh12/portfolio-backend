import dns from "node:dns";
import dotenv from "dotenv";

// Set default DNS resolution to prioritize IPv4 and use Google DNS
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

import app from "./app";

// Same as the previously working deploy: API_PORT first (the Railway domain targets it),
// default host (all interfaces). PORT/3000 are only fallbacks when API_PORT is not set.
const PORT = process.env.API_PORT || process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});