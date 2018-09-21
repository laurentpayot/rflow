CustomType = require './CustomType'
{isType, isAnyType} = require '.'

class TypedSet extends CustomType
	constructor: (@type) ->
		super(arguments, 1, 1) # exactly 1 argument
		CustomType.warn "Use 'Set' type instead of a #{@constructor.name}
						with values of any type." if isAnyType(@type)
		CustomType.error "'#{@constructor.name}' argument can not be a literal
					of type '#{@type}'." if @type?.constructor in [undefined, String, Number, Boolean]
	validate: (val) ->
		return false unless val?.constructor is Set
		return true if isAnyType(@type)
		[val...].every((e) => isType(e, @type))

module.exports = CustomType.createHelper(TypedSet)
