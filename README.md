# transmogrifier
Transformation of properties into a binary string and back.

## "Randomization"
This library uses a mechanism to give the appearance of randomization. Every byte is prepended with a salt bit (local invert). Also, the overal string is ended with another salt bit (global invert). For each byte, if the local invert does not equal the global invert then each bit within that byte is inverted (0 becomes 1 and 1 becomes 0). Using this mechanism, two serial numbers containing the same properties can yeild completely different binary strings.

## Motivation (tl;dr)
The motivation behind this library was the need for a licensing tool. Our requirements were to have be able to generate a seemingly random serial number contianing useful unique system data. Ultimately, using this tool we generate a binary sting which we convert to base32 which yeilds a short unique serial number that can be communicated easily over the phone or email.

## Install
```bash
npm install transmogrifier.js
```

## Usage (properties to binary string)
```javascript
var Transmogrifier = require('transmogrifier.js');
var transmogrifier = new Transmogrifier({
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
});
transmogrifier.set({
  version: 1,
  hardwareId: 4000
});

console.log(transmogrifier.toString()); // prints 1111111101111100001010111110
```

## Usage (binary string to properties)
```javascript
var Transmogrifier = require('transmogrifier.js');
var transmogrifier = new Transmogrifier({
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
});

transmogrifier.set('1111111101111100001010111110');

console.log(transmogrifier.get()); // prints { "version": 1, "hardwareId": 4000 }
```

## Documentation

### Transmogrifier(schema)
Generates a new transmogrifier instance using the schema object. The schema object is a required argument and represents the properties that are to be serialized into the string.

#### schema
Object hash representing the propertes that are intended to be serialized into the binary string. The key represents the property name and are order sensitive. The order of the keys is the order in which they are encoded into the string. Each key must have an object as its value which must contain a bytes key. The bytes key represents the number of bytes that are avaiable to that property.
```javascript
var schema = {
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
};
```

#### Properties

##### salt
Property of the object that defines the salt. The salt is used as a means by which to generate changes within the string to make it appear random. It is a read/write value. A value is automatically generated on initialization but can be overridden manually by using this property. The value of salt can be in either a binary string value, a numeric value or equal to Math.random. If you set salt to Math.random, it will automatically generate a new salt from 0 to the max possible value.
```javascript
var Transmogrifier = require('transmogrifier.js');

var schema = {
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
};

var transmogrifier = new Transmogrifier(schema);
// The number of bits in the salt will be equal to the total number of bytes plus one.
// The salt can be a binary string or a numeric value.

// As a binary string
transmogrifier.salt = '1000';

// As a number
transmogrifier.salt = 8;

// Set random salt
transmogrifier.salt = Math.random;
```

### #set()
Sets the values of one or more properties. This method has multiple signatures. When there is a single parameter and it is an object, the object keys must correlate to properties of the schema. The respective values will then be set to those keys. When there is a single argument which is a string, then it must be a binary string. Said binary string will then be decoded into respective properties. Lastly, the set method can take two parameters, the first a string  (property name) and second a corresponding value. See examples below.
```javascript
// Set using an object
var Transmogrifier = require('transmogrifier.js');

var schema = {
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
};

var transmogrifier = new Transmogrifier(schema);
transmogrifier.set({
  version: 2
});
```

```javascript
// Set properties from binary string
var Transmogrifier = require('transmogrifier.js');
var transmogrifier = new Transmogrifier({
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
});

transmogrifier.set('1111111101111100001010111110');
```

```javascript
// Set using a property and value
var Transmogrifier = require('transmogrifier.js');

var schema = {
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
};

var transmogrifier = new Transmogrifier(schema);
transmogrifier.set('verion', 2);
```

### #get()
Return the value of the specified property. If no propety is specified an object representing all values is returned.
```javascript
var Transmogrifier = require('transmogrifier.js');

var schema = {
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
};

var transmogrifier = new Transmogrifier(schema);
transmogrifier.set('verion', 2);
console.log(transmogrifier.get('version')); // prints 2
```

### #toString()
Returns the string equivalent of the current object.
```javascript
var Transmogrifier = require('transmogrifier.js');
var transmogrifier = new Transmogrifier({
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
});
transmogrifier.set({
  version: 1,
  hardwareId: 4000
});

console.log(transmogrifier.toString()); // prints 1111111101111100001010111110
```
