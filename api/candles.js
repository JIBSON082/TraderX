// Vercel serverless function: fetches Yahoo Finance candles server-side so the browser has no CORS problem.
module.exports = async (req, res) => {
  const { symbol, interval, range } = req.query;
  if (!/^[A-Za-z0-9=\-.^]{1,15}$/.test(symbol || '') || !/^(1m|5m)$/.test(interval || '') || !/^\d{1,2}d$/.test(range || '')) {
    return res.status(400).json({ error: 'bad request' });
  }
  let status = 0;
  for (const host of ['query1', 'query2']) {
    try {
      const r = await fetch(
        `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', Accept: 'application/json' } }
      );
      status = r.status;
      if (r.ok) {
        res.setHeader('Cache-Control', 's-maxage=15');
        return res.status(200).json(await r.json());
      }
    } catch (e) {}
  }
  res.status(502).json({ error: 'Yahoo unreachable', status });
};
