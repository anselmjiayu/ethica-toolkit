import Input from "~/data/spinoza-ethica-en-elwes.json";
import { Scanner } from "~/interpreter/scanner";
import { Parser } from "~/interpreter/parser";

const scanner = new Scanner(Input);
const tokens = scanner.run();
const parser = new Parser(tokens);
export const en_ast = parser.parse();