// noinspection JSUnusedGlobalSymbols

export default (req, res) => {
  const now = new Date();

  const timestamp = now.getTime();

  const pad = (n) => String(n).padStart(2, "0");

  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ timestamp, date, time }));
};
