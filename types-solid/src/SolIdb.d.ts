interface Store {
    name: string;
    keyPath: string;
}
export declare class SolIdb {
    private idbDatabase;
    private stores;
    private version;
    private idbOpenDBRequest;
    private DB_NAME;
    constructor(DB_NAME: string, stores: Array<Store>);
    private triggerOnSuccess;
    private triggerOnUpgradeNeeded;
    private setIdbDatabase;
    getIDB(): IDBDatabase | undefined;
    private setVersion;
    private getVersion;
    private addToStoresList;
    private createStore;
    getAllStores(): Array<Store>;
    save(storeName: string, object: any, callback?: any): Promise<void>;
    get(storeName: string, key: IDBValidKey): Promise<any>;
    getAll(storeName: string): Promise<any[]>;
    update(storeName: string, key: IDBValidKey, value: any, callback?: any): Promise<any>;
    delete(storeName: string, key: any, callback?: any): Promise<any>;
    checkIfContainsStore(): Promise<boolean>;
}
export {};
