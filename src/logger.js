import pino from "pino";
import pretty from "pino-pretty";
import fs from "node:fs";
import path from "node:path";

const isProd = process.env.NODE_ENV === "production";
const LEVEL = process.env.LOG_LEVEL || (isProd ? "info" : "debug");
const LOG_ROOT = path.resolve(process.env.LOG_DIR || "logs");
const RETENTION_DAYS = Number(process.env.LOG_RETENTION_DAYS || 14);

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, "0");
const today = () => {
  const d = new Date(); // server local time
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// pino numeric levels: trace 10, debug 20, info 30, warn 40, error 50, fatal 60
const levelOf = (line) => {
  const m = /"level":(\d+)/.exec(line);
  return m ? Number(m[1]) : 0;
};
const exactly = (n) => (line) => levelOf(line) === n;
const atLeast = (n) => (line) => levelOf(line) >= n;
const isHttp = (line) => line.includes('"responseTime"');

/* ---------- daily folder stream ---------- */
// Writes to logs/<YYYY-MM-DD>/<fileName>, switching folders at midnight.
class DailyFileStream {
  constructor(fileName, accept) {
    this.fileName = fileName;
    this.accept = accept;
    this.date = null;
    this.dest = null;
  }

  #rotate(date) {
    const old = this.dest;
    this.dest = pino.destination({
      dest: path.join(LOG_ROOT, date, this.fileName),
      mkdir: true,
      sync: false,
    });
    this.date = date;
    if (old) old.end();
  }

  write(line) {
    if (!this.accept(line)) return;
    const date = today();
    if (date !== this.date) this.#rotate(date);
    this.dest.write(line);
  }

  flushSync() {
    this.dest?.flushSync?.();
  }

  end() {
    this.dest?.end();
  }
}

/* ---------- retention: delete old date folders ---------- */
function cleanOldLogs() {
  try {
    if (!fs.existsSync(LOG_ROOT)) return;
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    for (const name of fs.readdirSync(LOG_ROOT)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(name)) continue; // only touch date folders
      const [y, m, d] = name.split("-").map(Number);
      if (new Date(y, m - 1, d).getTime() < cutoff) {
        fs.rmSync(path.join(LOG_ROOT, name), { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.error("Log cleanup failed:", err);
  }
}
cleanOldLogs();
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000).unref();

/* ---------- streams ---------- */
const consoleStream = isProd
  ? process.stdout
  : pretty({ colorize: true, translateTime: "SYS:HH:MM:ss" });

const streams = [
  { level: LEVEL, stream: consoleStream },

  // Files: each does its own exact filtering
  { level: "trace", stream: new DailyFileStream("all.log", () => true) },
  { level: "trace", stream: new DailyFileStream("debug.log", exactly(20)) },
  { level: "trace", stream: new DailyFileStream("info.log", exactly(30)) },
  { level: "trace", stream: new DailyFileStream("warn.log", exactly(40)) },
  { level: "trace", stream: new DailyFileStream("error.log", atLeast(50)) }, // error + fatal
  { level: "trace", stream: new DailyFileStream("http.log", isHttp) },       // request logs only
];

const logger = pino(
  {
    level: LEVEL,
    base: { service: "restaurant-api", env: process.env.NODE_ENV, pid: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: { err: pino.stdSerializers.err },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers['set-cookie']",
        "password",
        "*.password",
        "*.token",
        "*.accessToken",
        "*.refreshToken",
      ],
      censor: "[REDACTED]",
    },
  },
  pino.multistream(streams)
);

export default logger;