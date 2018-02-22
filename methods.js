'use strict';

let db = require('./db');

let methods = {
    createUser: {
        description: `creates a new user, and returns the details of the new user`,
        params: ['user:the user object'],
        returns: ['user'],
        exec(userObj) {
            return new Promise((resolve) => {
                if (typeof (userObj) !== 'object') {
                    throw new Error('was expecting an object!');
                }
                let _userObj = JSON.parse(JSON.stringify(userObj));
                _userObj.id = (Math.random() * 10000000) | 0;
                resolve(db.users.save(userObj));
            });
        }
    },
    
    fetchUser: {
        description: `fetches the user of the given id`,
        params: ['id:the id of the user were looking for'],
        returns: ['user'],
        exec(userObj) {
            return new Promise((resolve) => {
                if (typeof (userObj) !== 'object') {
                    throw new Error('was expecting an object!');
                }
                resolve(db.users.fetch(userObj.id) || {});
            });
        }
    },
    
     fetchAllUsers: {
        description: `fetches the entire list of users`,
        params: [],
        returns: ['userscollection'],
        exec() {
            return new Promise((resolve) => {
                resolve(db.users.fetchAll() || {});
            });
        }
    },
    
    createTask: {
        description: `creates a new user, and returns the details of the new user`,
        params: ['task:the task object'],
        returns: ['task'],
        exec(taskObj) {
            return new Promise((resolve) => {
                let task = {
                    userId: taskObj.userId,
                    taskContent: taskObj.taskContent,
                    expiry: taskObj.expiry
                };
                
                resolve(db.tasks.save(task));
            });
        }
    }
};

module.exports = methods;