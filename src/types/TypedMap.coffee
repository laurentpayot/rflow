import Type from './Type'
import isValid from '../isValid'
import {isAny, isLiteral, getTypeName} from '../tools'

notDefined = (t) -> t is undefined or isAny(t)

class _Map extends Map
	# NB: cannot use @type argument as sets would store is inside data as a key-value pair
	constructor: (keysType, valuesType, map) ->
		super([map...])
		# overwriting set() inside constructor to use its types and map parameters
		@set = (k, v, context="") =>
			unless notDefined(valuesType) or isValid(v, valuesType)
				Type.error("#{if context then context+' ' else ''}map element value", v, valuesType)
			unless notDefined(keysType) or isValid(k, keysType)
				Type.error("#{if context then context+' ' else ''}map element key", k, keysType)
			map.set(k, v) # to have side effects
			super.set(k, v)

class TypedMap extends Type
	valuesType: undefined
	keysType: undefined
	# 1 or 2 arguments
	argsMin: 1
	argsMax: 2
	constructor: (t1, t2) ->
		super(arguments...)
		if arguments.length is 1
			Type.warn "Use 'Map' type instead of a #{@constructor.name} with values of any type." if isAny(t1)
			@valuesType = t1
		else
			Type.invalid "You cannot have both #{getTypeName(t1)} as keys type and #{getTypeName(t2)} as values type
					in a #{@constructor.name}." if isLiteral(t1) and isLiteral(t2)
			Type.warn "Use 'Map' type instead of a #{@constructor.name}
					with keys and values of any type." if isAny(t1) and isAny(t2)
			# [@keysType, @valuesType] = [t1, t2] # problem with Rollup commonjs plugin
			@keysType = t1
			@valuesType = t2
	validate: (val) -> switch
		when not (val instanceof Map) then false
		when notDefined(@keysType) and notDefined(@valuesType) then true
		when notDefined(@keysType) then Array.from(val.values()).every((e) => isValid(e, @valuesType))
		when notDefined(@valuesType) then Array.from(val.keys()).every((e) => isValid(e, @keysType))
		else
			keys = Array.from(val.keys())
			values = Array.from(val.values())
			keys.every((e) => isValid(e, @keysType)) and values.every((e) => isValid(e, @valuesType))
	getTypeName: ->
		kt = if @keysType isnt undefined then "keys of type '#{getTypeName(@keysType)}' and " else ''
		"map with #{kt}values of type '#{getTypeName(@valuesType)}'"
	# NB: https://stackoverflow.com/questions/43927933/why-is-set-incompatible-with-proxy
	#new Proxy(map,
	#	 https://stackoverflow.com/questions/43236329/why-is-proxy-to-a-map-object-in-es2015-not-working/43236808#43236808
	#	get: (m, prop, receiverProxy) =>
	#		ret = Reflect.get(m, prop, receiverProxy)
	#		return ret if notDefined(@keysType) and notDefined(@valuesType)
	#		if ret is Map.prototype.set
	#			(k, v) =>
	#				unless notDefined(@valuesType) or isValid(v, @valuesType)
	#					Type.error("#{if context then context+' ' else ''}map element value", v, @valuesType)
	#				unless isValid(k, @keysType) or isValid(k, @keysType)
	#					Type.error("#{if context then context+' ' else ''}map element key", k, @keysType)
	#				m.set(k, v)
	#		else ret)
	proxy: (map, context) ->
		# custom instantiation validation
		unless @validate(map)
			super(map, context) unless map instanceof Map
			m = new _Map(@keysType, @valuesType, new Map())
			m.set(e[0], e[1], context) for e in [map...]
		new _Map(@keysType, @valuesType, map)

export default Type.createHelper(TypedMap)
