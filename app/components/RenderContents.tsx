import { Scanner } from "~/interpreter/scanner";
 import Input from "~/data/spinoza-ethica-en-elwes.json";
// import Input from "~/data/spinoza-ethica-lat-gebhardt.json";
import { Parser } from "~/interpreter/parser";
import { Interpreter, InterpreterStyles } from "~/interpreter/interpreter";
import { ReactNode } from "react";


const styles: InterpreterStyles = {
    sourceClass: "",
    bookClass: "",
    sectionClass: "",
    axiomClass: "",
    definitionClass: "",
    propositionClass: "",
    demonstrationClass: "",
    scholiumClass: "",
  corollaryClass: "",
  explanationClass: "",
}


import stylesheet from "~/app/app.css?url";
const scanner = new Scanner(Input);
const tokens = scanner.run();
const parser = new Parser(tokens);
const ast = parser.parse();
const interpreter = new Interpreter(styles);
const element: ReactNode = ast ? interpreter.interpret(ast) : <h2>Parse error!!!</h2>;

export default function RenderContents() {
    return (
        <div className="wrapper">
            {element}
        </div>
    )
}
