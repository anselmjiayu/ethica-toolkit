export type Index = string;
export enum TokenType {
  // literal values are for debugging only
  SOURCE = "SOURCE",
  TITLE = "t",
  BOOK = "b",
  SECTION = "sect",
  EXPRESSION = "expr",
  SUBEXPRESSION = "subexpr",
  LABEL = "label",
  EOF = "EOF",
  // parser ignores null type
  NULL = "NULL",
}
export type Lexeme = string;
export type Literal = Object;

export class Token {
    readonly index: Index | undefined;
    readonly type: TokenType;
    readonly lexeme: Lexeme;
    readonly literal: Literal;

    constructor(type: TokenType, lexeme: Lexeme, literal: Literal, index: Index | undefined) {
        this.index = index;
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
    }

    toString(): string {
        return this.type + " " + this.lexeme + " " + this.index;
    }
}
