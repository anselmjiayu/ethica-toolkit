import { Token } from "../interpreter/token";

export abstract class Expr{
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export interface ExprVisitor<R> {
  visitSectionExpr(expr: Section): R;
  visitLabelExpr(expr: Label): R;
  visitPrefaceExpr(expr: Preface): R;
  visitDefinitionExpr(expr: Definition): R;
  visitAxiomExpr(expr: Axiom): R;
  visitPostulateExpr(expr: Postulate): R;
  visitPropositionExpr(expr: Proposition): R;
  visitLemmaExpr(expr: Lemma): R;
  visitDemonstrationExpr(expr: Demonstration): R;
  visitScholiumExpr(expr: Scholium): R;
  visitCorollaryExpr(expr: Corollary): R;
  visitExplanationExpr(expr: Explanation): R;
}

export class Section extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitSectionExpr(this);
  }

  readonly term: Token;
}

export class Label extends Expr{
  constructor(label: Token,term: Expr) {
    super();
    this.label = label;
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLabelExpr(this);
  }

  readonly label: Token;
  readonly term: Expr;
}

export class Preface extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitPrefaceExpr(this);
  }

  readonly term: Token;
}

export class Definition extends Expr{
  constructor(term: Token,parts: Expr[]) {
    super();
    this.term = term;
    this.parts = parts;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitDefinitionExpr(this);
  }

  readonly term: Token;
  readonly parts: Expr[];
}

export class Axiom extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitAxiomExpr(this);
  }

  readonly term: Token;
}

export class Postulate extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitPostulateExpr(this);
  }

  readonly term: Token;
}

export class Proposition extends Expr{
  constructor(term: Token,parts: Expr[]) {
    super();
    this.term = term;
    this.parts = parts;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitPropositionExpr(this);
  }

  readonly term: Token;
  readonly parts: Expr[];
}

export class Lemma extends Expr{
  constructor(term: Token,parts: Expr[]) {
    super();
    this.term = term;
    this.parts = parts;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLemmaExpr(this);
  }

  readonly term: Token;
  readonly parts: Expr[];
}

export class Demonstration extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitDemonstrationExpr(this);
  }

  readonly term: Token;
}

export class Scholium extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitScholiumExpr(this);
  }

  readonly term: Token;
}

export class Corollary extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitCorollaryExpr(this);
  }

  readonly term: Token;
}

export class Explanation extends Expr{
  constructor(term: Token) {
    super();
    this.term = term;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitExplanationExpr(this);
  }

  readonly term: Token;
}

