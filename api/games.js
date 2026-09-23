// Vercel serverless function: proxies the Free-to-Play Games API so the
// RapidAPI key is read from the RAPIDAPI_KEY environment variable on the
// server and never reaches the browser.
//   GET /api/games?category=mmorpg  -> list of games in a category
//   GET /api/games?id=452           -> details of one game
const HOST = "free-to-play-games-database.p.rapidapi.com";

module.exports = async (req, res) => {
   const key = process.env.RAPIDAPI_KEY;
   if (!key) {
      return res.status(500).json({ error: "RAPIDAPI_KEY is not configured" });
   }

   const { id, category = "mmorpg" } = req.query;
   const path = id
      ? `game?id=${encodeURIComponent(id)}`
      : `games?category=${encodeURIComponent(category)}`;

   try {
      const upstream = await fetch(`https://${HOST}/api/${path}`, {
         headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
      });
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
      res.status(upstream.status).json(await upstream.json());
   } catch {
      res.status(502).json({ error: "Upstream request failed" });
   }
};
