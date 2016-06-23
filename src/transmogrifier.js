var debug = require('debug')('transmogrifier.js');
var leftPad = require('left-pad');

var SerialCoder = function SerialCoder(schema) {
  if (!(this instanceof SerialCoder)) {
    debug('Class not called with new. Instantiate automatically.');
    return new SerialCoder();
  }
  debug('Instantiated new SerialCoder class.');

  if (typeof schema !== 'object') {
    debug('Schema argument not object. Actual: %s.', typeof schema);
    throw new TypeError('Schema argument is required and must be an object.');
  }

  if (Object.keys(schema).length === 0) {
    debug('Invalid schema. Must have at least one property.');
    throw new Error('Invlid schema object. Must have at least one property.');
  }

  this._schema = schema;

  this._values = {};
  this._primaryBytes = 0;
  for (var property in schema) {
    this._values[property] = undefined;
    if (!('bytes' in schema[property])) {
      schema[property].bytes = 1;
    }
    this._primaryBytes += schema[property].bytes;
  }

  var saltLength = this._primaryBytes + 1;
  var salt = Math.floor(Math.random() * (Math.pow(2, saltLength) - 1));
  this.salt = this._salt = leftPad(salt.toString(2), saltLength, 0);
  this._totalBits = this._primaryBytes * 8 + this.salt.length;

  Object.defineProperties(this, {
    'salt': {
      get: function() {
        debug('Get the value of the salt.');
        return this._salt;
      },
      set: function(value) {
        debug('Set the value of the salt to %s.', value);
        switch (typeof value) {
          case 'number':
            var max = Math.pow(2, saltLength) - 1;
            if (value < 0 || value > max) {
              throw new RangeError('Value must be between 0 and ' + max + '.');
            }
            break;
          case 'string':
            if (value.match(/[^0-1]/g)) {
              throw new TypeError('Salt string must be a binary string.');
            }
            if (value.length !== this._salt.length) {
              throw new RangeError('Salt string must be ' +
                this._salt.length + ' chracters.');
            }
            value = parseInt(value, 2);
            break;
          default:
            throw new TypeError(
              'Salt must be either a number or binary string.');
        }
        this._salt = leftPad(value.toString(2), saltLength, 0);
        return this._salt;
      }
    }
  });

  return this;
};

SerialCoder.prototype.get = function(property) {
  debug('Get value of property %s.', property);
  if (!(property in this._schema)) {
    debug('Property %s not defined. Unable to get value', property);
    throw new ReferenceError('Property ' + property + ' not defined.');
  }

  return this._values[property];
};

var setPropertyValue = function(property, value) {
  if (!(property in this._schema)) {
    debug('Property %s not defined. Unable to set value', property);
    throw new ReferenceError('Property ' + property + ' not defined.');
  }

  if (typeof value !== 'number') {
    debug('Property value not a number. Actual %s.', typeof value);
    throw new TypeError('Value must be a number.');
  }

  var maxValue = Math.pow(2, this._schema[property]) - 1;

  if (value < 0 || value > maxValue) {
    debug('Value outside valid range. Range 0 - %d. Value %d.',
      maxValue, value);
    throw new RangeError('Value outside range. Range 0 - ' +
      maxValue + '. Value ' + value + '.');
  }

  this._values[property] = value;
  return this._values[property];
};

SerialCoder.prototype.set = function(property, value) {
  if (typeof property === 'object') {
    debug('Set values of properties using an object. %o', property);
    for (var prop in property) {
      setPropertyValue.call(this, prop, property[prop]);
    }
  } else {
    debug('Set value of property %s to %s.', property, value);
    setPropertyValue.call(this, property, value);
  }
};

var deserialize = function(value) {
  debug('Decode string into properties.');

  if (typeof value !== 'string') {
    debug('Parameter must be a string. Passed in %s.', typeof value);
    throw new TypeError('First parameter must be a string.');
  }

  if (value.match(/[^0-1]/g)) {
    debug('SerialNumber string was not a binary string.');
    throw new TypeError('Parameter must be a binary string.');
  }

  if (value.length !== this._totalBits) {
    debug('Invalid string length.');
    throw new RangeError('Invalid string length. Expected %d.',
      this._totalBits);
  }

  var globalInvert = parseInt(value.charAt(this._totalBits - 1));
  var chunks = value.substr(0, this._totalBits - 1).match(/.{1,9}/g);
  chunks = chunks.map(function(chunk) {
    var localInvert = parseInt(chunk.charAt(0));
    var byte = chunk.substr(1);
    if (localInvert !== globalInvert) {
      byte = byte.split('').map(function(bit) {
        return parseInt(bit) ? 0 : 1;
      }).join('');
    }
    return byte;
  });

  for (var property in this._schema) {
    var propertyBytes = chunks.splice(0, this._schema[property].bytes);
    setPropertyValue.call(this, property,
      parseInt(propertyBytes.join(''), 2));
  }

  return this;
};

SerialCoder.prototype.toJSON =
  SerialCoder.prototype.toObject =
  function toJSON() {
    debug('Return values as JSON.');
    return this._values;
  };

SerialCoder.prototype.toProperties =
  SerialCoder.prototype.deserialize =
  deserialize;

var normalizeChunks = function(chunks, globalInvert, salt) {
  var saltIndex = 0;
  return chunks.map(function(chunk) {
    var localInvert = parseInt(salt.charAt(saltIndex));
    if (localInvert !== globalInvert) {
      chunk = chunk.split('').map(function(bit) {
        return parseInt(bit) ? 0 : 1;
      }).join('');
    }
    saltIndex++;
    return localInvert + chunk;
  });
};

SerialCoder.prototype.toString =
  SerialCoder.prototype.serialize =
  function() {
    debug('Return string value of serial.');

    var undefinedProperties = [];
    for (var property in this._schema) {
      if (this._values[property] === undefined) {
        undefinedProperties.push(property);
      }
    }
    if (undefinedProperties.length) {
      debug('There are some undefined properties. Cannot proceed.');
      throw new Error('All properties must be defined.' +
        ' The following properties are undefined: ' +
        undefinedProperties.join(', ') + '.');
    }

    var globalInvert = parseInt(this._salt.charAt(this._salt.length - 1));
    var salt = this._salt.substring(0, this._salt.length - 1);

    var serial = '';

    for (property in this._schema) {
      var bytes = this._schema[property].bytes;
      var bin = leftPad(this._values[property].toString(2), 8 * bytes, 0);
      var chunks = bin.match(/.{1,8}/g);
      serial += normalizeChunks(chunks, globalInvert, salt).join('');
    }

    return serial + globalInvert;
  };

module.exports = SerialCoder;
