import { Scanner } from "~/interpreter/scanner";
import Input from "~/data/spinoza-ethica-en-elwes.json";
import { Parser } from "~/interpreter/parser";
import { Interpreter, InterpreterConfig } from "~/interpreter/interpreter";
import { ReactNode } from "react";
import { defaultInterpreterStyles } from "~/styles/default_interpreter_style";


const transformLink = (link: string): string => {
    return "#" + link;
}

const config: InterpreterConfig = {
    linkBuilder: transformLink,
    anchorPrefix: "",
}
const scanner = new Scanner(Input);
const tokens = scanner.run();
const parser = new Parser(tokens);
const ast = parser.parse();
const interpreter = new Interpreter(defaultInterpreterStyles, config);
const element: ReactNode = ast ? interpreter.interpret(ast) : <h2>Parse error!!!</h2>;

export default function RenderContents() {
    return (
        <div className="wrapper">
            {element}
        </div>
    )
}
