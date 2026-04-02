import dns from "node:dns";
import dotenv from "dotenv";

// Set default DNS resolution to prioritize IPv4 and use Google DNS
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

import app from "./app";

const PORT = process.env.API_PORT;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});