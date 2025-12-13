const fs = require('fs');
const crypto = require('crypto');
const { get } = require('http');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(filename) {
    if(!filename) {
      throw new Error('Creating a repository requires a filename');
    }

    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch(err) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, { encoding: 'utf8' })
    );
  }

  async create(attrs) {
    attrs.id = this.randomId();
    // {email: "someemail@gmail.com", password: "somepassword"}

    const salt = crypto.randomBytes(8).toString('hex');

    // use promise for callback. so no need for callback
    const buf = await scrypt(attrs.password, salt, 64);

    const records = await this.getAll();
    const record = {
      ...attrs,
      password: `${buf.toString('hex')}.${salt}`
    }
    records.push(record);
    await this.writeAll(records);

    return record;
  }

  async comparePasswords(saved, supplied) {
    // saved => password in database, 'hashed.salt'
    const result = saved.split('.');
    const hashed = result[0];
    const salt = result[1];

    // script gives back buffer array w/ raw data
    const hashedSupplyBuffer = await scrypt(supplied, salt, 64);

    return hashed === hashedSupplyBuffer.toString('hex');
  }

  async writeAll(records) {
    // write updated records array back to users.json/this.filename
    await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find(record => record.id ===id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecord = records.filter(record => record.id !== id);
    await this.writeAll(filteredRecord);
  }
  async update(id, attrs){
    const records = await this.getAll();
    const record = records.find(record => record.id === id)
    if (!record) {
      throw new Error(`Record with id of ${id} not found`);
    }
    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();
    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }
}

module.exports = new UsersRepository('users.json');