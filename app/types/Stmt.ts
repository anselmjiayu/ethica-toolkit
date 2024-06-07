import { Token } from "../interpreter/token";
import { Expr } from "./Expr";

export abstract class Stmt{
  abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export interface StmtVisitor<R> {
  visitSourceStmt(stmt: Source): R;
  visitBookStmt(stmt: Book): R;
}

export class Source extends Stmt{
  constructor(title: Token,parts: (Stmt|Expr)[]) {
    super();
    this.title = title;
    this.parts = parts;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitSourceStmt(this);
  }

  readonly title: Token;
  readonly parts: (Stmt|Expr)[];
}

export class Book extends Stmt{
  constructor(title: Token,contents: Expr[]) {
    super();
    this.title = title;
    this.contents = contents;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitBookStmt(this);
  }

  readonly title: Token;
  readonly contents: Expr[];
}

