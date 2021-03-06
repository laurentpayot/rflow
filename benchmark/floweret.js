import { fn, check } from '../dist'

const TIMES = 10 * 1000

console.log("\n*** Floweret ***")

// example from https://codemix.github.io/flow-runtime/#/
const Person = {name: String}
const greet = fn(
	Person, String,
	function (person) {
		return 'Hello ' + person.name
	}
)

console.time(TIMES + " greets")
for (let i = 0; i < TIMES; i++) {
	let alice = check(Person, { name: 'alice' })
	alice.name = 'Alice'
	greet(alice)
}
console.timeEnd(TIMES + " greets")


const sum = fn(
	Array(Number), Number,
	function (a) {
		a[0] = -100
		return a.reduce((acc, curr) => acc + curr)
	}
)

console.time(TIMES + " sums")
for (let i = 0; i < TIMES; i++) {
	sum([...Array(100).keys()])
}
console.timeEnd(TIMES + " sums")
