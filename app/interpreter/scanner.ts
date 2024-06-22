import { Lexeme, Literal, Token, TokenType } from "./token";

export class Scanner {
    private current: InputObject;
    private readonly source: InputObject[];
    private readonly tokens: Token[];

    private done: boolean = false;

    constructor(input: InputObject) {
        this.source = [input];
        this.tokens = [];
        this.current = input;
    }

    run(): Token[] {
        // running the scanner should be idempotent.
        if (this.done) {
            return this.tokens;
        }
        while (!this.isAtEnd()) {
            this.scanToken();
        }

        this.addToken(TokenType.EOF);
        this.done = true;
        return this.tokens;
    }

    private scanToken() {
        // Check type and explicitly cast current token
        const nextTokenType = this.peek();
        switch (nextTokenType) {
            case TokenType.SOURCE:
                this.getSource();
                break;
            case TokenType.TITLE:
                this.getTitle();
                break;
            case TokenType.BOOK:
                this.getBook();
                break;
            case TokenType.SECTION:
                this.getSection();
                break;
            case TokenType.EXPRESSION:
                this.getStatement();
                break;
            case TokenType.SUBEXPRESSION:
                this.getSubstatement();
                break;
            default:
                this.addToken(TokenType.NULL, "", this.current)
                // ignore unmatched token
                break;
        }
        this.advance();

    }

    private getSource() {
        const source = this.current as Source;
        // Stack implementation inserts at end; reverse to preserve pre-order
        // create throwaway shallow copy to avoid mutating application state
        for (let next of [...source].reverse()) {
            this.source.push(next);
        }
        this.addToken(TokenType.SOURCE);
    }

    private getTitle() {
        const title = this.current as Title;
        this.addToken(TokenType.TITLE, title.text, title, title.index);
    }

    private getBook() {
        const book = this.current as Book;
        for (let next of [...book.enonces].reverse()) {
            this.source.push(next);
        }
        this.addToken(TokenType.BOOK, book.title, book, book.id);
    }

    private getSection() {
        const section = this.current as Section;
        this.addToken(TokenType.SECTION, section.title, section);
    }

    private getStatement() {
        const statement = this.current as Expression;
        for (let next of [...statement.childs].reverse()) {
            this.source.push(next);
        }
        this.addToken(TokenType.EXPRESSION, statement.text, statement, statement.id);
    }

    private getSubstatement() {
        const substatement = this.current as Subexpression;
        this.addToken(TokenType.SUBEXPRESSION, substatement.text, substatement, substatement.id);
    }


    private addToken(type: TokenType): void;
    private addToken(type: TokenType, lexeme: Lexeme, literal: Literal): void;
    private addToken(type: TokenType, lexeme: Lexeme, literal: Literal, index: string): void;
    private addToken(type: TokenType, lexeme?: Lexeme, literal?: Literal, index?: string): void {
        if (lexeme !== undefined && literal !== undefined && index !== undefined) {
            this.tokens.push(new Token(type, lexeme, literal, index));
            return;
        } else if (lexeme !== undefined && literal !== undefined){
            this.tokens.push(new Token(type, lexeme, literal, undefined));
            return;
        } else {
            this.tokens.push(new Token(type, "", "", undefined));
            return;
        }
    }

    private peek(): TokenType {
        // let TS do the checking
        if (this.isAtEnd()) return TokenType.EOF;
        if (isSource(this.current)) return TokenType.SOURCE;
        if (isTitle(this.current)) return TokenType.TITLE;
        if (isBook(this.current)) return TokenType.BOOK;
        if (isSection(this.current)) return TokenType.SECTION;
        if (isExpression(this.current)) return TokenType.EXPRESSION;
        if (isSubexpression(this.current)) return TokenType.SUBEXPRESSION;
        // fallthrough case
        return TokenType.NULL;
    }

    private advance() {
        // must check EOF before advancing
        this.current = this.source.pop() as InputObject;
    }

    private isAtEnd(): boolean {
        return this.source.length === 0;
    }
}



// =======

/*
  Utility types and functions
 */

/*
  Input Data Grammar

  Source:
  - Book[]

  Book:
  - index
  - id
  - (text: string | - title - enonces: Statement[])

  Statement:
  (
  - title
  - type
  )
  |
  (
  - id
  - title
  - text
  - type?
  - childs: Substatement[]
  )

  Substatement:
  - id
  - title?
  - type
  - text

 */

type Source = (Title | Book)[];

type Title = {
    index: string;
    id: string;
    text: string;
    enonces: undefined;
}
type Book = {
    index: string;
    id: string;
    title: string;
    enonces: (Section | Expression | Unmatched)[];
}
type Section = {
    title: string;
    type: string;
    childs: undefined;
}
type Expression = {
    id: string;
    title: string;
    text: string;
    type?: string;
    childs: (Subexpression | Unmatched)[];
}
type Subexpression = {
    id: string;
    title?: string;
    type: string;
    text: string;
}
type Unmatched = Object;
export type InputObject = Source | Title | Book | Section | Expression | Subexpression | Unmatched;

function isSource(x: any): x is Source {
    return x instanceof Array;
}
function isTitle(x: any): x is Title {
    return x.enonces === undefined && typeof x.text === "string" && x.childs === undefined && x.type === undefined;
}
function isBook(x: any): x is Book {
    return x.enonces instanceof Array && x.text === undefined
}
function isSection(x: any): x is Section {
    return typeof x.title === "string" && x.childs === undefined
}
function isExpression(x: any): x is Expression {
    return typeof x.title === "string" && typeof x.id === "string" && x.childs instanceof Array
}
function isSubexpression(x: any): x is Subexpression {
    return typeof x.type === "string" && typeof x.id === "string" && typeof x.text === "string"
}
function isUnmatched(x: any): x is Unmatched {
    return [isSource, isTitle, isBook, isSection, isExpression, isSubexpression].reduce((res, fn) => res && !fn(x), true);
}
