"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = exports.serverInfo = void 0;
var path = require('path');
var fs = require('fs');
var rawInfo = fs.readFileSync(path.join(__dirname, '../serverInfo.json'));
exports.serverInfo = JSON.parse(rawInfo);
var Worker = /** @class */ (function () {
    function Worker(inServerInfo) {
        Worker.serverInfo = inServerInfo;
    }
    return Worker;
}());
exports.Worker = Worker;
//# sourceMappingURL=ServerInfo.js.map