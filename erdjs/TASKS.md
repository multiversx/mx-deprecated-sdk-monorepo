# Future development and Tasks

## Typing system

Re-think generics. Make a difference between open-type generics such as `Optional<T>` and concrete, constructed generic types such as `Optional<U32>`.

Consider having a base class:

```
/**
 * A generic type, with a single type parameter.
 * Generics with multiple type parameters (such as tuples) aren't supported at this moment by `erdjs`.
 */
export class GenericType extends Type {
    private readonly typeParameter: Type;

    /**
     * By creating and instance, the generic type is closed (not open).
     */
    constructor(name: string, typeParameter: Type) {
        super(name);
        this.typeParameter = typeParameter;
    }

    getTypeParameter(): Type {
        return this.typeParameter;
    }
}
```

`OptionalType` and `VectorType` would subclass this one. One instance of either `GenericType` would actually be a closed, constructed generic type.

However, in order to support multiple type parameters, a new design is required: the `GenericType` should be able to receive an array of type parameters (closed types if generic as well). Then, we can design `Tuple<T1, T2>` etc. as subclasses.

Consider deprecating the concept of `TypeDescriptor`, and hold all required information in the `Type`. E.g. `new VectorType(new U32Type())` is equivalent to a type descriptor with `scopedTypes = ["Vector", "U32"]`. Make it possible such that one can parse a `Vector<U32>` into an actual `Type`, instead of into a `TypeDescriptor`.

Just like for `NumericalValue`, require the actual type in the constructor for generic types as well: `new Vector(items, new VectorType(new U32Type()))`. In order to have less verbose constructs and provide a better experience for SDK consumers, value-creating utilities should be provided (*semantic sugar*): `NewVectorU32` etc.

Consider not requiring the static property `One` on types anymore, allow instantiation of `Type` classes (they are light).

Consider not registering the types in the `TypeRegistry` (which acts as a `Type` provider as well), but register the constructors of types (factory functions) instead.

Make adjustments to `Type.isAssignableFrom()`, so that an `IInteractionChecker` could properly handle covariance and contravariance.

### Links and references

 - https://docs.microsoft.com/en-us/dotnet/framework/reflection-and-codedom/reflection-and-generic-types
 - https://stackoverflow.com/questions/2173107/what-exactly-is-an-open-generic-type-in-net
 - https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
