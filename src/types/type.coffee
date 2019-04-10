import Type from './Type'
import isValid from '../isValid'
import check from '../check'
import {getTypeName} from '../tools'

# to be used with as() to specify an alias
class AliasedType extends Type
	# exacly 1 argument
	argsMin: 1
	argsMax: 1
	constructor: (@type) ->
		super(arguments...)
		if @type instanceof Type or @type?.rootClass is Type
			Type.warn "Usage of '#{@helperName}' is not needed with type #{@type.helperName or @type.constructor.name}."
	validate: (val) -> isValid(val, @type)
	getTypeName: -> getTypeName(@type)
	helperName: "type"
	# checkWrap: (val, context) -> check(@type, val, context)
	# checkWrap: @type.checkWrap if @type instanceof Type or @type?.rootClass is Type

export default Type.createHelper(AliasedType)
