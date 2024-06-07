import {expect, test} from 'vitest';
import { Interpreter, InterpreterStyles } from "~/interpreter/interpreter";
import { la_ast } from './la_gebhardt_instance';
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

const interpreter = new Interpreter(styles);

test("parser works properly", () => {
  expect(la_ast).toHaveProperty("parts");
  expect(la_ast?.parts).toHaveLength(6);
})


