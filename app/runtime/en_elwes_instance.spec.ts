import {expect, test} from 'vitest';
import { Interpreter, InterpreterStyles } from "~/interpreter/interpreter";
import { en_ast } from "~/runtime/en_elwes_instance";
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
  expect(en_ast).toHaveProperty("parts");
  expect(en_ast?.parts).toHaveLength(6);
})

