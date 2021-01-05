import * as errors from "../../errors";
import { BetterType } from "./types";

export class TypeExpressionParser {
    private static readonly symbols: string[] = [ "<", ">", ",", "(", ")" ];
    private static readonly tokenizerSeparator = "|";

    private state: State;

    constructor() {
        this.state = new WaitTypeNameState();
    }

    parse(expression: string): BetterType {
        let tokens = this.tokenize(expression);

        for (const token of tokens) {
            let isSymbol = TypeExpressionParser.symbols.includes(token);

            if (isSymbol) {
                // on symbol...
            } else {
                // on word...
            }
        }

        return new BetterType("", []);
    }

    tokenize(expression: string): string[] {
        let separator = TypeExpressionParser.tokenizerSeparator;

        if (expression.includes(separator)) {
            throw new errors.ErrTypingSystem(`type expression should not contain: ${separator}`);
        }

        for (const symbol of TypeExpressionParser.symbols) {
            expression = expression.split(symbol).join(separator);
        }

        let tokens = expression.split(separator);
        return tokens;
    }
}

class Node {
    private name: string;
    private parent?: Node;
    private children: Node[];

    constructor(parent?: Node) {
        this.name = "";
        this.parent = parent;
        this.children = [];
    }

    getParent(): Node {
        if (!this.parent) {
            throw new errors.ErrTypingSystem(`this is root node`);
        }

        return this.parent;
    }

    setName(name: string) {
        if (!name) {
            throw new errors.ErrTypingSystem(`empty node name`);
        }
        if (this.name) {
            throw new errors.ErrTypingSystem(`node name already set: ${this.name}`);
        }
    }

    addChild(): Node {
        let child = new Node(this);
        this.children.push(child);
        return child;
    }
}

abstract class State {
    onWord(_word: string, _focusedNode: Node, _parser: TypeExpressionParser) {
        throw new errors.ErrTypingSystem(`bad action`);
    }

    onSymbolLessThan(_focusedNode: Node, _parser: TypeExpressionParser) {
        throw new errors.ErrTypingSystem(`bad action`);
    }

    onSymbolGreaterThan(_focusedNode: Node, _parser: TypeExpressionParser) {
        throw new errors.ErrTypingSystem(`bad action`);
    }

    onSymbolComma(_focusedNode: Node, _parser: TypeExpressionParser) {
        throw new errors.ErrTypingSystem(`bad action`);
    }
}

class WaitTypeNameState extends State {
}
