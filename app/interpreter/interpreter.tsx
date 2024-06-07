import { ReactNode } from "react";
import { Expr, Axiom, Corollary, Definition, Demonstration, Explanation, ExprVisitor, Proposition, Scholium, Section, Label, Preface, Postulate, Lemma } from "app/types/Expr";
import { Book, Source, Stmt, StmtVisitor } from "app/types/Stmt";
import { MarkupProcessor } from "~/markup-processor/markup";

export type InterpreterStyles = {
  sourceClass: string;
  bookClass: string;
  sectionClass: string;
  axiomClass: string;
  definitionClass: string;
  propositionClass: string;
  demonstrationClass: string;
  scholiumClass: string;
  corollaryClass: string;
  explanationClass: string;
}

export type InterpreterConfig = {
  linkBuilder: (link: string) => string;
}

export class Interpreter implements StmtVisitor<ReactNode>, ExprVisitor<ReactNode> {

  constructor(styles: InterpreterStyles, config: InterpreterConfig) {
    this.styles = styles;
    this.config = config;
  }

  interpret(ast: Expr | Stmt): ReactNode {
    return ast.accept(this);
  }

  // The visitor methods are responsible for converting lexical information to semantic HTML
  // styling is delegated to a passed in config object

  visitSourceStmt(source: Source): ReactNode {
    return (<>
      {/* The title interpretation is done; delegating to children AST nodes */}
      {source.parts.map(s => s.accept(this))}
      </>);
  }

  // Book titles should be h1
  visitBookStmt(book: Book): ReactNode {
    return (<>
      <h1 id={book.title.index} className={this.styles.bookClass} 
        >{this.renderText(book.title.lexeme)}</h1>
      {book.contents.map(e => e.accept(this))}
      </>);
  }

  visitSectionExpr(section: Section): ReactNode {
    return (<h3 id={section.term.index} key={section.term.lexeme} className={this.styles.sectionClass}
    >{this.renderText(section.term.lexeme)}</h3>);
  }

  visitLabelExpr(expr: Label): ReactNode {
    return (<dl id={expr.label.index} key={expr.label.index}>
      <dt>{expr.label.lexeme}</dt>
      <dd>{expr.term.accept(this)}</dd>
    </dl>)
  }

  visitPrefaceExpr(expr: Preface): ReactNode {
    return (
    <p className={this.styles.propositionClass} 
        >{this.renderText(expr.term.lexeme)}</p>
    )
  }

  visitAxiomExpr(axiom: Axiom): ReactNode {
    return (<p /* id={axiom.term.index} */ className={this.styles.axiomClass} 
      >{this.renderText(axiom.term.lexeme)}</p>);
  }

  visitDefinitionExpr(defn: Definition): ReactNode {
    return (
      <>
      <p /* id={defn.term.index} */ className={this.styles.definitionClass}
      >{this.renderText(defn.term.lexeme)}</p>
        {defn.parts.map(p => p.accept(this))}
      </>);
  }

  visitPostulateExpr(expr: Postulate): ReactNode {
      return (
    <p className={this.styles.propositionClass} 
        >{this.renderText(expr.term.lexeme)}</p>
      )
  }

  visitPropositionExpr(prop: Proposition): ReactNode {
    return (
      <>
      <p /* id={prop.term.index} */ className={this.styles.propositionClass}
          >{this.renderText(prop.term.lexeme)}</p>
        {prop.parts.map(p => p.accept(this))}
      </>);
      
  }

  visitLemmaExpr(expr: Lemma): ReactNode {
    return (
      <>
      <p /* id={prop.term.index} */ className={this.styles.propositionClass}
          >{this.renderText(expr.term.lexeme)}</p>
        {expr.parts.map(p => p.accept(this))}
      </>);
  }

  visitScholiumExpr(schol: Scholium): ReactNode {
    return (<p /* id={schol.term.index} */ className={this.styles.scholiumClass}
      >{this.renderText(schol.term.lexeme)}</p>);
  }

  visitCorollaryExpr(corol: Corollary): ReactNode {
    return (<p /* id={corol.term.index} */ className={this.styles.corollaryClass}
      >{this.renderText(corol.term.lexeme)}</p>);
  }

  visitExplanationExpr(expl: Explanation): ReactNode {
    return (<p /* id={expl.term.index} */ className={this.styles.explanationClass}
      >{this.renderText(expl.term.lexeme)}</p>);
  }

  visitDemonstrationExpr(dem: Demonstration): ReactNode {
    return (<p /* id={dem.term.index} */ className={this.styles.demonstrationClass}
      >{this.renderText(dem.term.lexeme)}</p>);
  }

  private renderText(input: string) {
    return this.processMarkup(this.trimBeforePunctuation(input))
  }

  private processMarkup(input: string): ReactNode {
    const processor = new MarkupProcessor(this.config.linkBuilder, input);
    return processor.run();
  }

  // matches link format in string literal: (text)[index]

  // matches italics format in string literal: _text_
  // I am making assertions about italics formatting: 
  // (1) The opening underscore is followed by an alphanumeric character 
  // or '(' or '['
  // (2) The closing underscore is not followed by an alphanumeric character
  // or end of string.
  // From this section in the title:
  // ETHICA Ordine Geometrico demonstrata _ET_ _In quinque Partes distincta_ _in quibus agitur,_
  // the expression should not match the whitespace between the italic parts.
  private readonly italicsRx = /_([\w\(\[][^_]*)_([^\w\(]|$)/g;

  // this is a quirk in the input text.
  private readonly trimBeforePunctuationRx = / ([,;:])/g;

  private trimBeforePunctuation(input: string): string {
    return input.replace(this.trimBeforePunctuationRx, (_match, p1)=>p1);
  }


  // it's not a good idea to reassign this because the entire document tree will be rerendered
  private readonly styles;
  private readonly config;

}
