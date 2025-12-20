const fs = require('fs');
const crypto = require('crypto');
const { get } = require('http');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);
const Repository = require('./repository')

class UsersRepository extends Repository {
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
}

module.exports = new UsersRepository('users.json');