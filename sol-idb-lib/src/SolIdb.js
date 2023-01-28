"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolIdb = void 0;
var Errors_1 = require("./Errors");
var SolIdb = /** @class */ (function () {
    function SolIdb(DB_NAME, stores) {
        this.stores = [];
        this.version = 1;
        this.DB_NAME = DB_NAME;
        this.stores = stores;
        var idbOpenDBRequest = window.indexedDB.open(DB_NAME, this.version);
        this.idbOpenDBRequest = idbOpenDBRequest;
        idbOpenDBRequest.addEventListener('error', function (ev) {
        });
        this.triggerOnSuccess();
        this.triggerOnUpgradeNeeded(stores);
    }
    SolIdb.prototype.triggerOnSuccess = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (self.idbDatabase) {
                resolve();
            }
            self.idbOpenDBRequest.onsuccess = function (ev) {
                //@ts-ignore
                self.idbDatabase = ev.target.result;
                resolve();
            };
            self.idbOpenDBRequest.onerror = function (err) {
                reject(err);
            };
        });
    };
    SolIdb.prototype.triggerOnUpgradeNeeded = function (stores) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.idbOpenDBRequest.onupgradeneeded = function (ev) {
                console.log("[DB_INFO]: Upgrade Version ", ev.oldVersion, "-> ", ev.newVersion);
                //@ts-ignore
                self.idbDatabase = ev.target.result;
                if (!(stores === null || stores === void 0 ? void 0 : stores.length)) {
                    return;
                }
                var flag;
                for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                    var store = stores_1[_i];
                    flag = self.createStore(store);
                }
                resolve();
            };
        });
    };
    SolIdb.prototype.setIdbDatabase = function (idbDatabase) {
        this.idbDatabase = idbDatabase;
    };
    SolIdb.prototype.getIDB = function () {
        return this.idbDatabase;
    };
    SolIdb.prototype.setVersion = function (version) {
        this.version = version;
    };
    SolIdb.prototype.getVersion = function () {
        var self = this;
        return self.version;
    };
    SolIdb.prototype.addToStoresList = function (store) {
        this.stores.push(store);
    };
    SolIdb.prototype.createStore = function (store) {
        var self = this;
        var idbDatabase = this.getIDB();
        if (!idbDatabase) {
            throw new Error(Errors_1.Errors.DB_NOT_FOUND);
        }
        if (idbDatabase.objectStoreNames.contains(store.name)) {
            return false;
        }
        idbDatabase.createObjectStore(store.name, {
            keyPath: store.keyPath
        });
        self.addToStoresList(store);
        return true;
    };
    SolIdb.prototype.getAllStores = function () {
        return this.stores;
    };
    SolIdb.prototype.save = function (storeName, object, callback) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors_1.Errors.STORE_NOT_FOUND);
                }
                var transaction = idbDatabase.transaction(storeName, 'readwrite');
                if (!transaction)
                    return;
                transaction.oncomplete = function (ev) {
                };
                transaction.onerror = function (err) {
                    reject(err);
                };
                var store = transaction.objectStore(storeName);
                var request = store.add(object);
                request.onsuccess = function (ev) {
                    if (callback) {
                        callback();
                    }
                    resolve();
                };
                request.onerror = function (err) {
                    reject(err);
                };
            });
        });
    };
    SolIdb.prototype.get = function (storeName, key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors_1.Errors.STORE_NOT_FOUND);
                }
                var tx = idbDatabase.transaction(storeName, "readonly");
                tx.onerror = function (err) {
                    reject(err);
                };
                var store = tx.objectStore(storeName);
                var req = store.get(key);
                req.onsuccess = function (ev) {
                    resolve(req.result);
                };
                req.onerror = function (ev) {
                    reject();
                };
            });
        });
    };
    SolIdb.prototype.getAll = function (storeName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors_1.Errors.STORE_NOT_FOUND);
                }
                var tx = idbDatabase.transaction(storeName, "readonly");
                var store = tx.objectStore(storeName);
                var req = store.getAll();
                req.onsuccess = function (ev) {
                    resolve(req.result);
                };
                req.onerror = function (ev) {
                    reject();
                };
            });
        });
    };
    SolIdb.prototype.update = function (storeName, key, value, callback) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors_1.Errors.STORE_NOT_FOUND);
                }
                if (!idbDatabase.objectStoreNames.contains(storeName)) {
                    reject(Errors_1.Errors.STORE_NOT_FOUND);
                }
                var tx = idbDatabase.transaction(storeName, "readwrite");
                tx.onerror = function (err) {
                    reject(err);
                };
                var store = tx.objectStore(storeName);
                var req = store.put(value);
                req.onsuccess = function () {
                    if (callback) {
                        callback();
                    }
                    resolve(req.result);
                };
                req.onerror = function (err) {
                    reject(err);
                };
            });
        });
    };
    SolIdb.prototype.delete = function (storeName, key, callback) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors_1.Errors.STORE_NOT_FOUND);
                }
                var tx = idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.transaction(storeName, "readwrite");
                tx.onerror = function (err) {
                    reject(err);
                };
                var store = tx.objectStore(storeName);
                var req = store.delete(key);
                req.onsuccess = function () {
                    if (callback) {
                        callback();
                    }
                    resolve(req.result);
                };
                req.onerror = function (err) {
                    reject(err);
                };
            });
        });
    };
    SolIdb.prototype.checkIfContainsStore = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var _a;
                var idbDatabase = self.getIDB();
                if (idbDatabase && ((_a = idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    resolve(true);
                    return;
                }
                resolve(false);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    SolIdb.prototype.clearIDBStore = function (storeName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors_1.Errors.STORE_NOT_FOUND);
                }
                var tx = idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.transaction(storeName, "readwrite");
                tx.onerror = function (err) {
                    reject(err);
                };
                var store = tx.objectStore(storeName);
                var clearRequest = store.clear();
                clearRequest.onsuccess = function (event) {
                    resolve();
                };
                clearRequest.onerror = function (event) {
                    reject();
                };
            });
        });
    };
    return SolIdb;
}());
exports.SolIdb = SolIdb;
