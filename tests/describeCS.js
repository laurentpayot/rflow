// A "describe" callback must not return a value.
// Returning a value from "describe" will fail the test in a future version of Jest.
// => wrapping describe for use in CoffeeScript test files
const describeJS = global.describe
global.describe = (name, f) => describeJS(name, function () { f() })
