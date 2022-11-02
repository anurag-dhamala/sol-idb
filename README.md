# sol-idb
IndexDB that is rock solid. Dead simple and clear to use.

**Installation:**
```
npm install sol-idb

//Or use your favorite package manager.
```


**Start using right away:**
```javascript
import { SolIdb } from "sol-idb/types-solid";
//OR
// import { SolIdb } from "sol-idb";

let DB_NAME = "db"; //name of database to create

//Array of stores to create while initializing sol-idb
let stores = [
    {
        name: "my_store", // name of store
        keyPath: "id" // unique property of objects 
                      // to be stored
    },
    //...
];    
let my_db = new SolIdb(DB_NAME, stores);
```
You are free to create more than one database with above method.


With **my_db**, you are now able to access easy methods to save, get and update objects in **my_db** database.
**All methods return Promise.** 

Available methods: 

- **save(storeName, value)** : To save the value in the mentioned store. _And yes, you can pass callbacks._

```javascript
let obj = { 
    name: "John Doe",
    id: "MY_UNIQUE_ID"
}
my_db.save("my_store", obj);
//OR 

function callback() {
    //something to do after saving the data.
}
my_db.save("my_store", obj, callback);

```


- **get(storeName, key)** : To get the value from store with provided key. Here, the key is the value of keyPath within object.
```javascript
let value = my_db.get("my_store", "MY_UNIQUE_ID");
```

- **getAll(storeName)** : To get all the values from the store.
```javascript
let value = my_db.getAll("my_store");
```

- **update(storeName, key, new_value, callback)** : To update the value for the given key within the provided store. Callback is available here too (as optional parameter).
```javascript

let newValue = { 
    name: "Next John Doe",
    id: "MY_UNIQUE_ID"
}

//Create Callback if required
function updateCallback () { 
    //something to do/trigger after successfull update.
}

my_db.update("my_store", "MY_UNIQUE_ID", newValue, updateCallback);

```

- **delete(storeName, key, callback)** : To delete the value for the given key within the provided store. Callback is available here too (as optional parameter).
```javascript

//Create Callback if required
function deleteCallback () { 
    //something to do/trigger after successful delete.
}

my_db.delete("my_store", "MY_UNIQUE_ID", deleteCallback);

```