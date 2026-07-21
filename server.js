import "dotenv/config";
import express from "express";
import cors from "cors";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const app = express();
app.use(cors());
app.use(express.json());

const FLOW_URL = process.env.POWER_AUTOMATE_URL;
const TOKEN_RESOURCE = process.env.TOKEN_RESOURCE || "https://service.flow.microsoft.com/";
const PORT = process.env.PORT || 3000;

/**
 * Gets a fresh Azure AD access token using the local `az login` session.
 * Requires Azure CLI installed and `az login` run in this same terminal.
 */
async function getToken() {
  const { stdout } = await execAsync(`az account get-access-token --resource ${TOKEN_RESOURCE}`);
  const parsed = JSON.parse(stdout);
  if (!parsed.accessToken) throw new Error("No accessToken in az CLI output");
  return parsed.accessToken;
}

app.post("/api/extract", async (req, res) => {
  const { company, url } = req.body || {};

  if (!company || !url) {
    return res.status(400).json({ error: "Both 'company' and 'url' are required." });
  }
  if (!FLOW_URL) {
    return res.status(500).json({ error: "Server is missing POWER_AUTOMATE_URL — set it in server/.env" });
  }

  let token;
  try {
    token = await getToken();
  } catch (err) {
    console.error("Token fetch failed:", err.message);
    return res.status(401).json({
      error: "Could not get an Azure AD token. Run `az login` in this server's terminal, then try again.",
      details: err.message
    });
  }

  try {
    const flowRes = await fetch(FLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ company, url })
    });

    const text = await flowRes.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }

    if (!flowRes.ok) {
      return res.status(502).json({ error: `Flow responded with ${flowRes.status}`, details: body });
    }

    res.json(body);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Could not reach the Power Automate flow", details: String(err) });
  }
});

app.get("/api/health", async (req, res) => {
  let tokenOk = false;
  try {
    await getToken();
    tokenOk = true;
  } catch (err) {
    console.error("Token fetch failed:", err.message);
  }
  res.json({ ok: true, flowConfigured: Boolean(FLOW_URL), azLoginActive: tokenOk });
});

app.listen(PORT, () => {
  console.log(`Extraction proxy running at http://localhost:${PORT}`);
});
