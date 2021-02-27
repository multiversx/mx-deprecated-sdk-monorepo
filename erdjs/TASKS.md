## Typing system

Just like for `NumericalValue`, require the actual type in the constructor for generic types as well: `new Vector(items, new VectorType(new U32Type()))`. In order to have less verbose constructs and provide a better experience for SDK consumers, value-creating utilities should be provided (*semantic sugar*): `NewVectorU32` etc.

TODO: showcase.spec.ts
TODO: update readme

### Links and references

 - https://docs.microsoft.com/en-us/dotnet/framework/reflection-and-codedom/reflection-and-generic-types
 - https://stackoverflow.com/questions/2173107/what-exactly-is-an-open-generic-type-in-net
