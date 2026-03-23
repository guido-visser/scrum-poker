const fs = require("fs");
const path = require("path");
const util = require("util");

const logDirectory = path.join(__dirname, "../logs");
const logFile = path.join(logDirectory, "server.log");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const formatMessage = (level, args) => {
    const timestamp = new Date().toISOString();
    const message = args
        .map((arg) =>
            typeof arg === "string" ? arg : util.inspect(arg, { depth: 5 })
        )
        .join(" ");

    return `[${timestamp}] [${level}] ${message}\n`;
};

const writeLog = (level, args) => {
    try {
        fs.appendFileSync(logFile, formatMessage(level, args));
    } catch (error) {
        process.stderr.write(
            `Failed to write to log file ${logFile}: ${error.message}\n`
        );
    }
};

const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};

const attachLogger = () => {
    console.log = (...args) => {
        writeLog("INFO", args);
        originalConsole.log(...args);
    };

    console.warn = (...args) => {
        writeLog("WARN", args);
        originalConsole.warn(...args);
    };

    console.error = (...args) => {
        writeLog("ERROR", args);
        originalConsole.error(...args);
    };
};

module.exports = {
    attachLogger,
    logFile,
    writeLog,
};
