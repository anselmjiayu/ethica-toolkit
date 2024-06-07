import Input from "~/data/spinoza-ethica-lat-gebhardt.json";
import { Scanner } from "~/interpreter/scanner";
import { Parser } from "~/interpreter/parser";

const scanner = new Scanner(Input);
const tokens = scanner.run();
const parser = new Parser(tokens);
export const la_ast = parser.parse();

