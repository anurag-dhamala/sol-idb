import {Errors } from "./Errors";

interface Store {
    name: string;
    keyPath: string;
}

export class VivIdb {
    private idbDatabase: IDBDatabase | undefined;
    private stores: Array<Store> = [];
    private version: number = 1;
    private idbOpenDBRequest: IDBOpenDBRequest;
    private DB_NAME: string;

    public constructor(DB_NAME: string, stores: Array<Store>) {
        this.DB_NAME = DB_NAME;
        this.stores = stores;
        let idbOpenDBRequest: IDBOpenDBRequest = window.indexedDB.open(DB_NAME, this.version);
        this.idbOpenDBRequest = idbOpenDBRequest;
        idbOpenDBRequest.addEventListener('error', function(ev){
        });
        this.triggerOnSuccess();
        this.triggerOnUpgradeNeeded(stores);
    }

    private triggerOnSuccess(): Promise<void>{
        let self = this;
        return new Promise<void>(function(resolve, reject) {
            if(self.idbDatabase) {
                resolve();
            }
            self.idbOpenDBRequest.onsuccess = function (ev) {
                //@ts-ignore
                self.idbDatabase= ev.target.result;
                resolve();
            }
        });
    }

    private triggerOnUpgradeNeeded(stores?: Array<Store>) {
        let self = this;
        return new Promise<void>(function (resolve, reject) {
            self.idbOpenDBRequest.onupgradeneeded = function (ev ){
                console.log("[DB_INFO]: Upgrade Version ",ev.oldVersion, "-> ",ev.newVersion);
                //@ts-ignore
                self.idbDatabase = ev.target.result;
                if(!stores?.length) {
                    return;
                }
                let flag;
                for (let store of stores) {
                    flag = self.createStore(store);
                }
                resolve();
            }
        });

    }

    private setIdbDatabase(idbDatabase: any) {
        this.idbDatabase = idbDatabase;
    }

    public getIDB(){
        return this.idbDatabase;
    }

    private setVersion(version: number) {
        this.version = version;
    }

    private getVersion() {
        let self = this;
        return self.version;
    }

    private addToStoresList (store: Store){
        this.stores.push(store);
    }

    private createStore(store: Store): boolean {
        let self = this;
        let idbDatabase = this.getIDB();
        if(!idbDatabase){
            throw new Error(Errors.DB_NOT_FOUND);
        }
        if(idbDatabase.objectStoreNames.contains(store.name)){
            return false;
        }
        idbDatabase.createObjectStore(store.name, {
            keyPath: store.keyPath
        });
        self.addToStoresList(store);
        return true;
    }

    public getAllStores():Array<Store> {
        return this.stores;
    }

    public save(storeName: string, object: any, callback?: any) {
        let self = this;
        return new Promise<void>(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if(!idbDatabase?.objectStoreNames.contains(storeName)){
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let transaction = idbDatabase.transaction(storeName, 'readwrite');
                if(!transaction) return;
                transaction.oncomplete = function (ev) {
                }

                transaction.onerror = function (err) {
                }
                let store = transaction.objectStore(storeName);
                let request = store.add(object);

                request.onsuccess = function (ev) {
                    if(callback) {
                        callback();
                    }
                    resolve();
                }
            });
        });

    }

    public get(storeName: string, key: any) {
        let self = this;
        return new Promise<any>(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if(!idbDatabase?.objectStoreNames.contains(storeName)){
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase.transaction(storeName, "readonly");
                let store = tx.objectStore(storeName);

                let req = store.get(key);
                req.onsuccess = function (ev) {
                    resolve(req.result);
                }

                req.onerror = function (ev){
                    reject();
                }
            })
        })

    }

    public getAll(storeName: string) {
        let self = this;
        return new Promise<any[]>(function (resolve, reject) {
            self.triggerOnSuccess().then(function () {
                let idbDatabase = self.getIDB();
                if(!idbDatabase?.objectStoreNames.contains(storeName)){
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase.transaction(storeName, "readonly");
                let store = tx.objectStore(storeName);

                let req = store.getAll();
                req.onsuccess = function (ev) {
                    resolve(req.result);
                }

                req.onerror = function (ev){
                    reject();
                }
            })
        })
    }

    public update (storeName: string, key: any, value: any, callback?: any) {
        let self = this;
        return new Promise<any>(function(resolve, reject) {
            self.triggerOnSuccess().then(function() {
                let idbDatabase = self.getIDB();
                if(!idbDatabase?.objectStoreNames.contains(storeName)){
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                if(!idbDatabase.objectStoreNames.contains(storeName)) {
                    reject(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase.transaction(storeName, "readwrite");
                let store = tx.objectStore(storeName);
                let req = store.put(value);
                req.onsuccess = function () {
                    if(callback) {
                        callback();
                    }
                    resolve(req.result);
                }
                req.onerror = function (err) {
                    reject(err);
                }
            });
        })
    }

    public delete(storeName: string, key: any, callback?: any) {
        let self = this;
        return new Promise<any>(function (resolve, reject) {
            self.triggerOnSuccess().then(function() {
                let idbDatabase = self.getIDB();
                if(!idbDatabase?.objectStoreNames.contains(storeName)){
                    throw new Error(Errors.STORE_NOT_FOUND);
                }
                let tx = idbDatabase?.transaction(storeName, "readwrite");
                let store = tx.objectStore(storeName);
                let req = store.delete(key);
                req.onsuccess = function () {
                    if(callback) {
                        callback();
                        resolve(req.result);
                    }
                }
                req.onerror = function (err) {
                    reject(err)
                }
            })
        });
    }
}