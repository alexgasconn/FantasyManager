import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 5173);

  app.use((req, res, next) => {
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    res.header('Access-Control-Allow-Origin', corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-League, X-User');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json());

  // === Biwenger Proxy Endpoints ===

  app.post("/api/biwenger/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const response = await fetch("https://biwenger.as.com/api/v2/auth/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from Biwenger:', text.substring(0, 200));
        return res.status(response.status).json({
          error: `Invalid response from Biwenger: ${response.statusText}`,
          details: text.substring(0, 200)
        });
      }

      res.status(response.status).json(data);
    } catch (e) {
      console.error('Login error:', e);
      res.status(500).json({ error: "Internal Error", details: e instanceof Error ? e.message : String(e) });
    }
  });

  app.get("/api/biwenger/account", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const response = await fetch("https://biwenger.as.com/api/v2/account", {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader || "",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.get("/api/biwenger/catalog", async (req, res) => {
    try {
      const response = await fetch("https://biwenger.as.com/api/v2/competitions/la-liga/data?lang=es&score=5", {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.get("/api/biwenger/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const league = req.headers["x-league"] as string;
      const user = req.headers["x-user"] as string;
      const response = await fetch("https://biwenger.as.com/api/v2/user?fields=players(*,clause,owner)", {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader || "",
          "X-League": league || "",
          "X-User": user || "",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.get("/api/biwenger/league", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const leagueId = req.headers["x-league"] as string;
      const user = req.headers["x-user"] as string;
      const response = await fetch(`https://biwenger.as.com/api/v2/league/${leagueId}?include=all&fields=*`, {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader || "",
          "X-League": leagueId || "",
          "X-User": user || "",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.get("/api/biwenger/market", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const league = req.headers["x-league"] as string;
      const user = req.headers["x-user"] as string;
      const response = await fetch("https://biwenger.as.com/api/v2/market", {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader || "",
          "X-League": league || "",
          "X-User": user || "",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });


  app.get("/api/biwenger/player/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const response = await fetch(`https://cf.biwenger.com/api/v2/players/la-liga/${slug}?lang=es&season=2025&fields=*,prices,reports(points,home,events,status(status,statusInfo),match(round,home,away,date))`, {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.get("/api/biwenger/board", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const leagueId = req.headers["x-league"] as string;
      const user = req.headers["x-user"] as string;
      const offset = req.query.offset || 0;
      const limit = req.query.limit || 50;

      const response = await fetch(`https://biwenger.as.com/api/v2/league/${leagueId}/board?type=transfer,market&offset=${offset}&limit=${limit}`, {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader || "",
          "X-League": leagueId || "",
          "X-User": user || "",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  app.get("/api/biwenger/fixtures", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const leagueId = req.headers["x-league"] as string;

      const response = await fetch(`https://biwenger.as.com/api/v2/league/${leagueId}/schedule`, {
        headers: {
          "Content-type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader || "",
          "X-League": leagueId || "",
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  // === FutbolFantasy Scraping Proxy ===
  app.get("/api/scrape/equipo/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const url = `https://www.futbolfantasy.com/laliga/equipos/${slug}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: `FutbolFantasy returned ${response.status}` });
      }
      const html = await response.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (e) {
      console.error('Scrape error:', e);
      res.status(500).json({ error: 'Scraping failed' });
    }
  });

  app.get("/api/clubelo", async (req, res) => {
    try {
      // Get yesterday's date to ensure data is available, as today might not be updated yet
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const dateStr = date.toISOString().split("T")[0];

      const response = await fetch(`http://api.clubelo.com/${dateStr}`);
      const csv = await response.text();
      res.status(200).send(csv);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
