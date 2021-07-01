const assert = require("assert");
const StormDB = require("../index.js");

class LocalStorage {
  constructor() {
    this.data = [];
  }

  setItem(key, value) {
    this.data[key] = value;
  }

  getItem(key) {
    return this.data[key];
  }
}

describe("Browser Engine", function () {
  it("should successfully read data", function () {
    // simulate browser local storage
    global.localStorage = new LocalStorage();
    localStorage.setItem("db", '{ "key": "value" }');

    const engine = new StormDB.browserEngine("db");
    const db = new StormDB(engine);

    let value = db.get("key").value();
    assert.strictEqual(value, "value");
  });

  it("should create empty database if it doesn't exist yet", function () {
    global.localStorage = new LocalStorage();

    const engine = new StormDB.browserEngine("db");
    const db = new StormDB(engine);

    let value = db.value();
    assert.deepStrictEqual(value, {});
  });

  it("should successfully write data", function () {
    // simulate browser local storage
    global.localStorage = new LocalStorage();
    localStorage.setItem("db", '{ "key": "value" }');

    const engine = new StormDB.browserEngine("db");
    const db = new StormDB(engine);

    db.set("key", "newValue");
    db.save();

    // extract updated data
    let savedValue = JSON.parse(localStorage.data.db)["key"];
    assert.strictEqual(savedValue, "newValue");
  });

  it("should throw error if trying to read incorrect data", function () {
    // simulate browser local storage with corrupted database
    global.localStorage = new LocalStorage();
    localStorage.setItem("db", "{");

    const engine = new StormDB.browserEngine("db");

    const loadDB = () => {
      new StormDB(engine);
    };

    assert.throws(loadDB, Error);
  });

  it("should utilise custom deserialize function", function () {
    // simulate browser local storage
    global.localStorage = new LocalStorage();
    localStorage.setItem("db", '{ "key": "value" }');

    const engine = new StormDB.browserEngine("db", {
      deserialize: () => "deserialized data",
    });
    const db = new StormDB(engine);

    let value = db.value();
    assert.strictEqual(value, "deserialized data");
  });

  it("should utilise custom serialize function", function () {
    // simulate browser local storage
    global.localStorage = new LocalStorage();
    localStorage.setItem("db", '{ "key": "value" }');

    const engine = new StormDB.browserEngine("db", {
      serialize: () => "serialized data",
    });
    const db = new StormDB(engine);

    db.save();

    let savedData = localStorage.data.db;
    assert.strictEqual(savedData, "serialized data");
  });
});
