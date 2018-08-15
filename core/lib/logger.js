'use strict';
const winston = require('winston');
const env = process.env.NODE_ENV || 'development';

class Logger {
    constructor() {
        this.logger = new(winston.Logger)({
            transports: [
                new(winston.transports.Console)({
                    level: env === 'development' ? 'debug' : 'info',
                    colorize: true,
                }),
            ],
        });
    }

    info(message) {
        this.logger.info(message);
    }

    debug(message) {
        this.logger.debug(message);
    }

    error(message) {
        this.logger.error(message);
    }
}

module.exports = Logger;