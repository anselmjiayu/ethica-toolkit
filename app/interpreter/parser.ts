import { Book, Source, Stmt } from "app/types/Stmt";
import { Axiom, Corollary, Definition, Demonstration, Explanation, Label, Lemma, Postulate, Preface, Proposition, Scholium, Section } from "app/types/Expr";
import { Token, TokenType } from "./token";

class ParseError extends Error {
}

export type ParseResult = Source | undefined;

export class Parser {
  private readonly tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  parse(): ParseResult {
    let ast;
    try {
      ast = this.source();
    } catch(e) {
      this.synchronize();
      console.error("Error happened while parsing:", e);
    }
    return ast;
  }

  private source(): Source {
    const token = this.consume(TokenType.SOURCE, "Expect source name");
    const parts = [];
    while (!this.isAtEnd()) {
      if (this.match(TokenType.TITLE, TokenType.SECTION)) {
        parts.push(this.section());
      } else if (this.match(TokenType.BOOK)){
        parts.push(this.book());
      } else {
        console.error("Error at source(), ", parts.length, this.current, this.peek());
        this.synchronize();
      }
    }
    return new Source(token, parts);
  }

  private book(): Book {
    const token = this.consume(TokenType.BOOK, "Expect book name");
    const contents = [];
    while (true) {
      if (this.match(TokenType.SECTION)) {
        contents.push(this.section());
      } else if (this.match(TokenType.EXPRESSION)) {
        contents.push(this.label());
      } else break;
    }
    return new Book(token, contents);
  }

  // The work for identifying and labelling expressions and subexpressions is collected here
  private label(): Label {
    const termIndex = this.peek().index;
    if (termIndex === undefined) throw this.error(this.peek(), 
      "Expect term index to exist");
    const serialIndex = this.serialIndex(termIndex);

    // to be initalized in the giant switch statement
    let label, expr;

    if(this.match(TokenType.EXPRESSION)) {

      if (this.matchDefn()) {
        expr = this.definition();
        label = "D" + serialIndex + ": ";
      } else if (this.matchAxiom()) {
        expr = this.axiom();
        label = "A" + serialIndex + ": ";
      } else if (this.matchPostulate()) {
        expr = this.postulate();
        label = "Postulate " + serialIndex + ": ";
      } else if (this.matchPreface()) {
        expr = this.preface();
        label= "Preface: ";
      } else if (this.matchLemma()) {
        expr = this.lemma();
        label= "Lemma " + serialIndex + ": ";
      }
      else {
        expr = this.proposition();
        label = "Prop. " + serialIndex + ": ";
      }
    } else if (this.match(TokenType.SUBEXPRESSION)) {
      if (this.matchDem()) {
        expr = this.demonstration();
        label = "Dem. " + serialIndex + ": ";
      } else if (this.matchSchol()) {
        expr = this.scholium();
        label = "Schol. " + serialIndex + ": ";
      } else if (this.matchCoroll()) {
        expr = this.corollary();
        label = "Coroll. " + serialIndex + ": ";
      } else if (this.matchExpl()) {
        expr = this.explanation();
        label = "Expl. " + serialIndex + ": ";
      } else {
        throw this.error(this.peek(), 
          "Subexpression matching failed: unknown token");
      }

    } else throw this.error(this.peek(), 
      "Expect label() to be called on an expresion or subexpression");

    // The scanner does not add labels, so a new token is created here
    const idx = expr.term.index;
    if(idx === undefined)
    throw this.error(expr.term, "Expect index to exist on a label")
    const token = new Token(TokenType.LABEL, label, {expr}, idx);
    return new Label(token, expr);

  }

  private serialIndex(index: string): string {
    // the regular expression is guaranteed to match end of string
    const indexValue = Number.parseInt(index.match(/[0-9]{0,2}$/)![0], 10);
    // return empry string if parse returns 0 or NaN
    return indexValue > 0 ? indexValue.toString() : "";
  }

  private section(): Section {
    if (this.match(TokenType.TITLE)) {
      const token = this.consume(TokenType.TITLE, "Expect title");
      return new Section(token);
    } else if (this.match(TokenType.SECTION)){
      const token = this.consume(TokenType.SECTION, "Expect section declaration");
      return new Section(token);
    } else {
      console.error(this.peek());
      throw this.error(this.peek(), "parse failed: unknown token");
    }
  }

  private axiom(): Axiom {
    const token = this.consume(TokenType.EXPRESSION, "Expect axiom");
    return new Axiom(token);
  }

  private definition(): Definition {
    const token = this.consume(TokenType.EXPRESSION, "Expect definition");
    const parts = [];
    while (this.check(TokenType.SUBEXPRESSION)) {
      parts.push(this.label());
    }
    return new Definition(token, parts);
  }

  private matchPreface(): boolean {
    const idx = this.peek().index;
    return !!idx && !!idx.match(/pr$/);
  }

  private matchAxiom(): boolean {
    const idx = this.peek().index;
    return !!idx && !!idx.match(/a[1-9]?$/);
  }

  private matchDefn(): boolean {
    // Definitions belong to expressions; demonstrations belong to subexpressions
    const idx = this.peek().index;
    // Definitions for affections in Bk. III ends with "adxx"
    return !!idx && !!idx.match(/d[0-9]{0,2}$/);
  }

  private matchPostulate(): boolean {
    const idx = this.peek().index;
    return !!idx && !!idx.match(/p[1-9]$/);
  }

  private proposition(): Proposition {
    const token = this.consume(TokenType.EXPRESSION, "Expect proposition");
    const parts = [];
    while (this.check(TokenType.SUBEXPRESSION)) {
      parts.push(this.label());
    }
    return new Proposition(token, parts);
  }

  private lemma(): Lemma {
    const token = this.consume(TokenType.EXPRESSION, "Expect lemma");
    const parts = [];
    while (this.check(TokenType.SUBEXPRESSION)) {
      parts.push(this.label());
    }
    return new Lemma(token, parts);
  }

  private demonstration(): Demonstration {
    const token = this.consume(TokenType.SUBEXPRESSION, "Expect demonstration");
    return new Demonstration(token);
  }

  private scholium(): Scholium {
    const token = this.consume(TokenType.SUBEXPRESSION, "Expect scholium");
    return new Scholium(token);
  }

  private corollary(): Corollary {
    const token = this.consume(TokenType.SUBEXPRESSION, "Expect corollary");
    return new Corollary(token);
  }

  private explanation(): Explanation {
    const token = this.consume(TokenType.SUBEXPRESSION, "Expect explanation");
    return new Explanation(token);
  }

  private preface(): Preface {
    const token = this.consume(TokenType.EXPRESSION, "Expect preface");
    return new Preface(token);
  }

  private postulate(): Postulate {
    const token = this.consume(TokenType.EXPRESSION, "Expect postulate");
    return new Postulate(token);
  }

  private matchDem(): boolean {
    // Definitions belong to expressions; demonstrations belong to subexpressions
    const idx = this.peek().index;
    return !!idx && !!idx.match(/d[1-9]?$/);
  }

  private matchSchol(): boolean {
    const idx = this.peek().index;
    return !!idx && !!idx.match(/sc[1-9]?$/);
  }

  private matchLemma(): boolean {
    const idx = this.peek().index;
    return !!idx && !!idx.match(/l[1-9]$/);
  }

  private matchCoroll(): boolean {
    const idx = this.peek().index;
    return !!idx && !idx.match(/sc[1-9]?$/) && !!idx.match(/c[0-9]{0,2}$/);
  }

  private matchExpl(): boolean {
    const idx = this.peek().index;
    return !!idx && (!!idx.match(/e$/) || !!idx.match(/a[0-9]?$/));
  }

  private match(...types: TokenType[]): boolean {
    for (let t of types) {
      if (this.check(t)) {
        // this.advance();
        return true;
      }
    }
    return false;
  }

  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      switch (this.peek().type) {
        case TokenType.BOOK:
        case TokenType.SECTION:
          return;
      }
      this.advance();
    }
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type))
      return this.advance();
    throw this.error(this.peek(), message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd())
      return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd())
      this.current = this.current+1;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private error(token: Token, message?: string): ParseError {
    console.error("Parse error at: ", token.toString(), message);
    return new ParseError();
  }
}
