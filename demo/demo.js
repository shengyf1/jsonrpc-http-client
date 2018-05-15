const JRPCHTTPClient = require('../src/jsonrpc-http-client');

let client = new JRPCHTTPClient('http://localhost:8080/test');

client.request('Hello', {
    title: 'Roman'
}, (err, result) => {
    console.log(err, result);
});

client.request('Ping', {
    title: 'Roman'
}, (err, result) => {
    console.log(err, result);
});

client.request('Test', {
    title: 'Roman'
}, (err, result) => {
    console.log(err, result);
});