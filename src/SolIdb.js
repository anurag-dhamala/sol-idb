import { Errors } from "./Errors";
export class SolIdb {
    constructor(DB_NAME, stores) {
        this.stores = [];
        this.version = 1;
        this.DB_NAME = DB_NAME;
        this.stores = stores;
        let idbOpenDBRequest = window.indexedDB.open(DB_NAME, this.version);
        this.idbOpenDBRequest = idbOpenDBRequest;
        idbOpenDBRequest.addEventListener('error', function (ev) {
        });
        this.triggerOnSuccess();
        this.triggerOnUpgradeNeeded(stores);
    }
    triggerOnSuccess() {
        let self = this;
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
    }
    triggerOnUpgradeNeeded(stores) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.idbOpenDBRequest.onupgradeneeded = function (ev) {
                console.log("[DB_INFO]: Upgrade Version ", ev.oldVersion, "-> ", ev.newVersion);
                //@ts-ignore
                self.idbDatabase = ev.target.result;
                if (!(stores === null || stores === void 0 ? void 0 : stores.length)) {
                    return;
                }
                let flag;
                for (let store of stores) {
                    flag = self.createStore(store);
                }
                resolve();
            };
        });
    }
    setIdbDatabase(idbDatabase) {
        this.idbDatabase = idbDatabase;
    }
    getIDB() {
        return this.idbDatabase;
    }
    setVersion(version) {
        this.version = version;
    }
    getVersion() {
        let self = this;
        return self.version;
    }
    addToStoresList(store) {
        this.stores.push(store);
    }
    createStore(store) {
        let self = this;
        let idbDatabase = this.getIDB();
        if (!idbDatabase) {
            throw new Error(Errors.DB_NOT_FOUND);
        }
        if (idbDatabase.objectStoreNames.contains(store.name)) {
            return false;
        }
        idbDatabase.createObjectStore(store.name, {
            keyPath: store.keyPath
        });
        self.addToStoresList(store);
        return true;
    }
    getAllStores() {
        return this.stores;
    }
    save(storeName, object, callback) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let transaction = idbDatabase.transaction(storeName, 'readwrite');
                if (!transaction)
                    return;
                transaction.oncomplete = function (ev) {
                };
                transaction.onerror = function (err) {
                    reject(err);
                };
                let store = transaction.objectStore(storeName);
                let request = store.add(object);
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
    }
    get(storeName, key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase.transaction(storeName, "readonly");
                tx.onerror = function (err) {
                    reject(err);
                };
                let store = tx.objectStore(storeName);
                let req = store.get(key);
                req.onsuccess = function (ev) {
                    resolve(req.result);
                };
                req.onerror = function (ev) {
                    reject();
                };
            });
        });
    }
    getAll(storeName) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase.transaction(storeName, "readonly");
                let store = tx.objectStore(storeName);
                let req = store.getAll();
                req.onsuccess = function (ev) {
                    resolve(req.result);
                };
                req.onerror = function (ev) {
                    reject();
                };
            });
        });
    }
    update(storeName, key, value, callback) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                if (!idbDatabase.objectStoreNames.contains(storeName)) {
                    reject(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase.transaction(storeName, "readwrite");
                tx.onerror = function (err) {
                    reject(err);
                };
                let store = tx.objectStore(storeName);
                let req = store.put(value);
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
    }
    delete(storeName, key, callback) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if (!(idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames.contains(storeName))) {
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.transaction(storeName, "readwrite");
                tx.onerror = function (err) {
                    reject(err);
                };
                let store = tx.objectStore(storeName);
                let req = store.delete(key);
                req.onsuccess = function () {
                    if (callback) {
                        callback();
                        resolve(req.result);
                    }
                };
                req.onerror = function (err) {
                    reject(err);
                };
            });
        });
    }
    checkIfContainsStore() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                var _a;
                let idbDatabase = self.getIDB();
                if (idbDatabase && ((_a = idbDatabase === null || idbDatabase === void 0 ? void 0 : idbDatabase.objectStoreNames) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    resolve(true);
                    return;
                }
                resolve(false);
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}
