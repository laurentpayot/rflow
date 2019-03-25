import isValid from './isValid'
import shouldBe from './shouldBe'
import Type from './types/Type'

objectProxy = (type, obj, path=[]) ->
	(obj[key] = objectProxy(val, obj[key], [key, path...])) for key, val of type when val?.constructor is Object
	error = (k, v, deletion) ->
		pathObject = if deletion then {} else {"#{k}": v}
		typeObject = {"#{k}": type[k]}
		for p in path
			pathObject = {"#{p}": pathObject}
			typeObject = {"#{p}": typeObject}
		throw new TypeError "Instance #{shouldBe(pathObject, typeObject)}."
	new Proxy(obj,
		set: (o, k, v) ->
			error(k, v) unless isValid(v, type[k])
			o[k] = v
			true # indicate success
		deleteProperty: (o, k) ->
			error(k, 0, true)
	)

arrayProxy = (type, arr) ->
	new Proxy(arr,
		set: (a, k, v) ->
			throw new TypeError "Array instance element #{k} #{shouldBe(v, type)}." unless isValid(v, type)
			a[k] = v
			true # indicate success
	)

export default (type, val) ->
	# custom types first for customized instantiation validity check
	return type.proxy(val) if type instanceof Type
	throw new TypeError "Instance #{shouldBe(val, type)}." unless isValid(val, type)
	switch
		when Array.isArray(type) and type.length is 1 then arrayProxy(type[0], val)
		when type?.constructor is Object then objectProxy(type, val)
		else val # no proxy

