'use strict';

let users = {};
let tasks = {};

let db = {
    users: proc(users),
    tasks: proc(tasks)
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function proc(container) {
    return {
        save(obj) {
            let _obj = clone(obj);
            console.log('savig', _obj);
            if (!_obj.id) {
                _obj.id = (Math.random() * 10000000) | 0;
            }
            
            container[_obj.id.toString()] = _obj;
            return clone(_obj);
        },
        fetch(id) {
            return clone(container[id.toString()]);
        },
        fetchAll() {
            let _bunch = [];
            for (let item in container) {
                _bunch.push(clone(container[item]));
            }
            return _bunch;
        },
        unset(id) {
            delete container[id];
        }
    }
}

module.exports = db;