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
var Transmogrifier = require('transmogrifier');
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

console.log(transmogrifier.toJSON()); // prints { "version": 1, "hardwareId": 4000 }
console.log(transmogrifier.toString()); // prints 1111111101111100001010111110
```

## Usage (binary string to properties)
```javascript
var Transmogrifier = require('transmogrifier');
var transmogrifier = new Transmogrifier({
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
});

serilizer.toProperties('1111111101111100001010111110');

console.log(serilizer.toJSON()); // prints { "version": 1, "hardwareId": 4000 }
console.log(transmogrifier.toString()); // prints 1111111101111100001010111110
```

## Documentation

### Transmogrifier(schema)
Generates a new transmogrifier instance using the schema object. The schema object is a required argument and represents the properties that are to be serialized into the string.

#### schema
Object hash representing the propertes that are intended to be serialized into the binary string. The key represents the property name and must have an object as its value. Each obect must contain a bytes key. This key represents the number of bytes that are avaiable to that property. Keys are order sensative. The order of the keys is the order in which they are encoded into the string. If you switch them up for decoding then you will not get the desired result.
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
Property of the object that defines the salt. The salt is used as a means by which to generate randomization within the string to make it appear random. It is a read/write value. A value is automatically generated on initialization but can be overridden manually by using this property. The value of salt can be in either a binary string value, a numeric value or equal to Math.random. If you set salt to Math.random, it will automatically generate a new salt from 0 to the max possible value.
```javascript
var Transmogrifier = require('transmogrifier');

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

### #set(property, value)
Set the value of the specified property.
```javascript
var Transmogrifier = require('transmogrifier');

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

### #set(properties)
Set the value of one or more properties by using an object hash of the properties and their values.
```javascript
var Transmogrifier = require('transmogrifier');

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

### #get(property)
Return the value of the specified property.
```javascript
var Transmogrifier = require('transmogrifier');

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

### #toJSON() (`alias` #toObject)
Return an object repesenting the properties and their respective values.
```javascript
var Transmogrifier = require('transmogrifier');

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
  version: 2,
  hardwareId: 10
});
console.log(transmogrifier.toJSON()); // prints { "version": 2, "hardwareId": 10 }
```

### #toString() (`alias` #serialize)
Returns the string equivalent of the current object.
```javascript
var Transmogrifier = require('transmogrifier');
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

### #toProperties(binaryString) (`alias` #deserialize)
Deserialize the provided binary string and set the values to their respective properties of the object.
```javascript
var Transmogrifier = require('transmogrifier');
var transmogrifier = new Transmogrifier({
  version: {
    bytes: 1
  },
  hardwareId: {
    bytes: 2
  }
});

serilizer.toProperties('1111111101111100001010111110');

console.log(serilizer.toJSON()); // prints { "version": 1, "hardwareId": 4000 }
```
