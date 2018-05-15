const URL = require('url'),
    http = require('http'),
    https = require('https');

var JsonRPCHTTPClient = function(serviceURL, errors) {
    

    let conn = URL.parse(serviceURL);

    this._port = conn.port || (conn.protocol === 'https:' ? 443 : 80);
    this._host = conn.hostname;
    this._path = conn.pathname;

    this._protocol = conn.protocol === 'https:' ? https : http;

    errors = errors || {}
    this._errors = {
        SERVER_ERROR: errors.SERVER_ERROR || {
            code: -32000,
            message: 'SERVER_ERROR'
        },
        PARSE_ERROR: errors.PARSE_ERROR || {
            code: -32700,
            message: 'PARSE_ERROR'
        }
    }
}

JsonRPCHTTPClient.prototype.request = function(method, params, callback) {
    if (typeof(params) === 'function') {
        callback = params;
        params = {};
    }

    params = params || {};

    let req = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000),
        method: method,
        params: params
    }

    this._httpRequest(req, callback);
}

JsonRPCHTTPClient.prototype._httpRequest = function(json, callback) {
    let bodyString = Buffer.from(JSON.stringify(json), 'utf8');

    let options = {
        host: this._host,
        path: this._path,
        port: this._port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': bodyString.byteLength
        }
    }


    const req = this._protocol.request(options, (res) => {
        var response = '';

        res.on('data', (chank) => {
            response += chank;
        });

        res.on('end', () => {
            this._onResponse(response, callback);
        });
    });

    req.on('error', (e) => {
        callback(Object.assign({ data: e.message }, this._errors.SERVER_ERROR));
    });

    req.write(bodyString);
}

JsonRPCHTTPClient.prototype._onResponse = function(content, callback) {
    try {
        content = JSON.parse(content);
    } catch (e) {
        console.log(e);
        callback(Object.assign({ data: content }, this._errors.PARSE_ERROR));
        return;
    }

    if (!content.jsonrpc || content.jsonrpc !== '2.0') {
        callback(Object.assign({ data: JSON.stringify(content) }, this._errors.SERVER_ERROR));
        return;
    }

    if (content.error) {
        callback(content.error);
        return;
    }

    callback(undefined, content.result);
}

module.exports = JsonRPCHTTPClient;