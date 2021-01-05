# Future development and Tasks

## Typing system

Consider deprecating the concept of `TypeDescriptor`, and hold all required information in the `Type`. E.g. `new VectorType(new U32Type())` is equivalent to a type descriptor with `scopedTypes = ["Vector", "U32"]`. Make it possible such that one can parse a `Vector<U32>` into an actual `Type`, instead of into a `TypeDescriptor`.

Just like for `NumericalValue`, require the actual type in the constructor for generic types as well: `new Vector(items, new VectorType(new U32Type()))`. In order to have less verbose constructs and provide a better experience for SDK consumers, value-creating utilities should be provided (*semantic sugar*): `NewVectorU32` etc.

Consider not requiring the static property `One` on types anymore, allow instantiation of `Type` classes (they are light).

Consider not registering the types in the `TypeRegistry` (which acts as a `Type` provider as well), but register the constructors of types (factory functions) instead.

Make adjustments to `Type.isAssignableFrom()`, so that an `IInteractionChecker` could properly handle covariance and contravariance.

### Links and references

 - https://docs.microsoft.com/en-us/dotnet/framework/reflection-and-codedom/reflection-and-generic-types
 - https://stackoverflow.com/questions/2173107/what-exactly-is-an-open-generic-type-in-net
 - https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
