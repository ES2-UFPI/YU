const fs = require("node:fs");
const path = require("node:path");
const appJson = require("./app.json");

const rootEnvPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(rootEnvPath)) {
    const rootEnv = fs.readFileSync(rootEnvPath, "utf8");

    for (const line of rootEnv.split(/\r?\n/)) {
        const match = line.match(/^(EXPO_PUBLIC_[A-Z0-9_]+)=(.*)$/);

        if (!match) {
            continue;
        }

        const [, key, rawValue] = match;
        const value = rawValue.trim().replace(/^["']|["']$/g, "");
        process.env[key] ??= value;
    }
}

module.exports = appJson.expo;