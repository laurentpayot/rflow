// Generated by CoffeeScript 2.3.1
(function() {
  // trows customized error
  var Splat, _Set, error, etc, isType, maybe, promised, sig, typeName, typeOf;

  error = function(msg) {
    throw new Error(`Type error: ${msg}`);
  };

  Splat = class Splat {
    constructor(type1) {
      this.type = type1;
    }

  };

  // shortcuts
  maybe = function(t) {
    return [
      void 0,
      null,
      t // checking undefined and null types first
    ];
  };

  promised = function(t) {
    return Promise.resolve(t);
  };

  _Set = function(t) {
    if (t === void 0) {
      return Set;
    } else {
      return new Set([t]);
    }
  };

  // _Map = (t) -> new Map([t])
  etc = function(t) {
    return new Splat(t);
  };

  // typeOf([]) is 'Array', whereas typeof [] is 'object'. Same for null, Promise etc.
  // NB: returning string instead of class because of special array case http://web.mit.edu/jwalden/www/isArray.html
  typeOf = function(val) {
    if (val === void 0 || val === null) {
      return '' + val;
    } else {
      return val.constructor.name;
    }
  };

  // not exported: get type name for error messages (supposing type is always correct)
  typeName = function(type) {
    var t;
    switch (typeOf(type)) {
      case 'Array':
        if (type.length === 1) {
          return `array of ${typeName(type[0])}`;
        } else {
          return ((function() {
            var l, len, results;
            results = [];
            for (l = 0, len = type.length; l < len; l++) {
              t = type[l];
              results.push(typeName(t));
            }
            return results;
          })()).join(" or ");
        }
        break;
      case 'Function':
        return type.name;
      case 'Object':
        return "custom type";
      default:
        return typeOf(type);
    }
  };

  // check that a value is of a given type or of any (undefined) type, e.g.: isType("foo", String)
  isType = function(val, type) {
    var k, v;
    switch (typeOf(type)) {
      case 'undefined':
      case 'null':
      case 'String':
      case 'Number':
      case 'Boolean':
        return val === type; // literal type or undefined or null
      case 'Function':
        return (val != null ? val.constructor : void 0) === type; // native type: Number, String, Object, Array (untyped), Promise…
      case 'Array':
        switch (type.length) {
          case 0:
            return true; // any type: `[]`
          case 1: // typed array type, e.g.: `Array(String)`
            if (!Array.isArray(val)) {
              return false;
            } else {
              return val.every(function(v) {
                return isType(v, type[0]);
              });
            }
            break;
          default:
            return type.some(function(t) {
              return isType(val, t);
            });
        }
        break;
      case 'Object': // Object type, e.g.: `{id: Number, name: {firstName: String, lastName: String}}`
        if ((val != null ? val.constructor : void 0) !== Object) {
          return false;
        }
        if (!Object.keys(type).length) {
          return !Object.keys(val).length;
        }
        for (k in type) {
          v = type[k];
          if (!isType(val[k], v)) {
            return false;
          }
        }
        return true; // type is not a class but an instance
      default:
        return error(`Type can not be an instance of ${typeName(type)}. Use the ${typeName(type)} class as type instead.`);
    }
  };

  // wraps a function to check its arguments types and result type
  sig = function(argTypes, resType, f) {
    if (!Array.isArray(argTypes)) {
      error("Signature: Array of arguments types is missing.");
    }
    if ((resType != null ? resType.constructor : void 0) === Function && !resType.name) {
      error("Signature: Result type is missing.");
    }
    if ((f != null ? f.constructor : void 0) !== Function) {
      error("Signature: Function to wrap is missing.");
    }
    return function(...args) { // returns an unfortunately anonymous function
      var arg, i, j, l, len, len1, m, ref, result, type;
// error "Too many arguments provided." unless arguments.length <= argTypes.length
      for (i = l = 0, len = argTypes.length; l < len; i = ++l) {
        type = argTypes[i];
        if ((type != null ? type.constructor : void 0) === Splat) {
          if (i + 1 < argTypes.length) {
            error("Signature: Splat must be the last element of the array of arguments.");
          }
          ref = args.slice(i);
          for (j = m = 0, len1 = ref.length; m < len1; j = ++m) {
            arg = ref[j];
            if (!isType(arg, type.type)) {
              error(`Argument number ${i + j + 1} (${arg}) should be of type ${typeName(type.type)} instead of ${typeOf(arg)}.`);
            }
          }
        } else {
          if (!(Array.isArray(type) && !type.length)) { // not checking type if type is any type (`[]`)
            if (args[i] === void 0) {
              if (!isType(void 0, type)) {
                error(`Missing required argument number ${i + 1}.`);
              }
            } else {
              if (!isType(args[i], type)) {
                error(`Argument number ${i + 1} (${args[i]}) should be of type ${typeName(type)} instead of ${typeOf(args[i])}.`);
              }
            }
          }
        }
      }
      if (isType(resType, Promise)) {
        // NB: not using `await` because CS would transpile the returned function as an async one
        return resType.then(function(promiseType) {
          var promise;
          promise = f(...args);
          if (!isType(promise, Promise)) {
            error("Function should return a promise.");
          }
          return promise.then(function(result) {
            if (!isType(result, promiseType)) {
              error(`Promise result (${result}) should be of type ${typeName(promiseType)} instead of ${typeOf(result)}.`);
            }
            return result;
          });
        });
      } else {
        result = f(...args);
        if (!isType(result, resType)) {
          error(`Result (${result}) should be of type ${typeName(resType)} instead of ${typeOf(result)}.`);
        }
        return result;
      }
    };
  };

  module.exports = {typeOf, isType, sig, maybe, promised, etc};

}).call(this);
