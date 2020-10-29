export enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    None = 5
}

export class Logger {
    static logLevel: LogLevel = LogLevel.Debug;

    static setLevel(logLevel: LogLevel) {
        Logger.logLevel = logLevel;
    }

    static trace(message?: any, ...optionalParams: any[]) {
        if (Logger.logLevel >= LogLevel.Debug) {
            return;
        }

        console.debug(message, optionalParams);
    }

    static debug(message?: any, ...optionalParams: any[]) {
        if (Logger.logLevel >= LogLevel.Debug) {
            return;
        }

        console.debug(message, optionalParams);
    }

    static info(message?: any, ...optionalParams: any[]) {
        if (Logger.logLevel >= LogLevel.Info) {
            return;
        }

        console.log(message, optionalParams);
    }

    static warn(message?: any, ...optionalParams: any[]) {
        if (Logger.logLevel >= LogLevel.Warn) {
            return;
        }

        console.warn(message, optionalParams);
    }

    static error(message?: any, ...optionalParams: any[]) {
        if (Logger.logLevel >= LogLevel.Error) {
            return;
        }

        console.error(message, optionalParams);
    }
}

