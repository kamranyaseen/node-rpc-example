'use strict';

let http = require('http');
let url = require('url');
let methods = require('./methods');
let types = require('./types');

let server = http.createServer(requestListener);
const PORT = process.env.NODE_PORT || 9090;

let routes = {
    '/rpc': function (body) {
        return new Promise((resolve, reject) => {
            let _json = JSON.parse(body); 
            let keys = Object.keys(_json);
            let promiseArr = [];

            if (!body) {
                response.statusCode = 400;
                response.end(`rpc request was expecting some data...!`);
                return;
            }

            for (let key of keys) {
                if (methods[key] && typeof (methods[key].exec) === 'function') {
                    let execPromise = methods[key].exec.call(null, _json[key]);
                    if (!(execPromise instanceof Promise)) {
                        throw new Error(`exec on ${key} did not return a promise`);
                    }
                    promiseArr.push(execPromise);
                } else {
                    let execPromise = Promise.resolve({
                        error: 'method not defined'
                    })
                    promiseArr.push(execPromise);
                }
            }

            Promise.all(promiseArr).then(iter => {
                console.log(iter);
                let response = {};
                iter.forEach((val, index) => {
                    response[keys[index]] = val;
                });

                resolve(response);
            }).catch(err => {
                reject(err);
            });
        });
    },


    '/describe': function () {
        return new Promise(resolve => {
            let type = {};
            let method = {};
            type = types;
            for(let m in methods) {
                let _m = JSON.parse(JSON.stringify(methods[m]));
                method[m] = _m;
            }
            
            resolve({
                types: type,
                methods: method
            });
        });
    }
};

function requestListener(request, response) {
    let reqUrl = `http://${request.headers.host}${request.url}`;
    let parseUrl = url.parse(reqUrl, true);
    let pathname = parseUrl.pathname;
    
    response.setHeader('Content-Type', 'application/json');
    let buf = null;
    request.on('data', data => {
        if (buf === null) {
            buf = data;
        } else {
            buf = buf + data;
        }
    });
    request.on('end', () => {
        let body = buf !== null ? buf.toString() : null;
        
        if (routes[pathname]) {
            let compute = routes[pathname].call(null, body);

            if (!(compute instanceof Promise)) {
                response.statusCode = 500;
                response.end('oops! server error!');
                console.warn(`whatever I got from rpc wasn't a Promise!`);
            } else {
                compute.then(res => {
                    response.end(JSON.stringify(res))
                }).catch(err => {
                    console.error(err);
                    response.statusCode = 500;
                    response.end('oops! server error!');
                });
            }

        } else {
            response.statusCode = 404;
            response.end(`oops! ${pathname} not found here`)
        }
    })
}

console.log(`starting the server on port ${PORT}`);
server.listen(PORT);