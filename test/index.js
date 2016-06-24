var chai = require('chai');
var expect = chai.expect;

var Transmogrifier = require('../src/transmogrifier');

describe('Transmogrifier', function() {
  var schema = {
    date: {
      bytes: 2
    },
    product: {
      bytes: 1
    },
    version: {
      bytes: 1
    },
    revision: {
      bytes: 1
    },
    hardwareId: {
      bytes: 6
    }
  };
  describe('constructor', function() {
    describe('without arguments', function() {
      it('should throw a TypeError', function() {
        expect(function() {
          new Transmogrifier();
        }).to.throw(TypeError);
      });
    });
    describe('with a string', function() {
      it('should throw a TypeError', function() {
        expect(function() {
          new Transmogrifier('yo!');
        }).to.throw(TypeError);
      });
    });
    describe('with a blank object', function() {
      it('should throw an error', function() {
        expect(function() {
          new Transmogrifier({});
        }).to.throw(Error);
      });
    });
    it('should be happy with a proper schema', function() {
      expect(function() {
        new Transmogrifier(schema);
      }).to.not.throw(Error);
    });
    it('should return an instance of Transmogrifier', function() {
      expect(new Transmogrifier(schema)).to.be.an.instanceof(Transmogrifier);
    });
  });
  describe('#toString()', function() {
    it('should throw an error without properties defined', function() {
      var transmogrifier = new Transmogrifier(schema);
      expect(function() {
        transmogrifier.toString();
      }).to.throw(Error);
    });
    it('should be okay if properties are defined', function() {
      var transmogrifier = new Transmogrifier(schema);
      transmogrifier.set({
        date: 0,
        product: 255,
        version: 1,
        revision: 0,
        hardwareId: 100
      });
      expect(function() {
        transmogrifier.toString();
      }).to.not.throw(Error);
    });
  });
  describe('#set()', function() {
    it('should be a function', function() {
      expect((new Transmogrifier(schema)).set).to.be.a('function');
    });
    it('should not error if passed a property and value', function() {
      var transmogrifier = new Transmogrifier(schema);
      expect(function() {
        transmogrifier.set('date', 12);
      }).to.not.throw(Error);
    });
    it('should not error if passed an object hash with properties and values',
      function() {
        var transmogrifier = new Transmogrifier(schema);
        expect(function() {
          transmogrifier.set({
            date: 100
          });
        }).to.not.throw(Error);
      });
    it('should not error if passing a valid binary string', function() {
      var transmogrifier = new Transmogrifier(schema);
      transmogrifier.set({
        date: 100,
        product: 1,
        version: 1,
        revision: 0,
        hardwareId: parseInt('1234567890', 16)
      });
      var serial = transmogrifier.toString();
      expect(function() {
        transmogrifier.set(serial);
      }).to.not.throw(Error);
    });
  });
  describe('#get()', function() {
    it('should be a function', function() {
      expect((new Transmogrifier(schema)).get).to.be.a('function');
    });
    it('should return the value of a property', function() {
      var transmogrifier = new Transmogrifier(schema);
      var property = 'date';
      var value = 12;
      transmogrifier.set(property, value);
      expect(transmogrifier.get(property)).to.equal(value);
    });
    it('should return an object if not providing a property', function() {
      var transmogrifier = new Transmogrifier(schema);
      var property = 'date';
      var value = 12;
      transmogrifier.set(property, value);
      expect(transmogrifier.get()).to.be.an('object');
    });
  });
});
