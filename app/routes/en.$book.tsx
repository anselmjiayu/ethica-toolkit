import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";

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

export function loader({params}: LoaderFunctionArgs) {
  // If index does not fall into 1-5, default to 1
  return params.book?.match(/^[1-5]$/) ? Number.parseInt(params.book) : 1;
}

const interpreter = new Interpreter(styles);
export default function ENBookPage() {
  const bookIndex = useLoaderData<typeof loader>();
  
  const section = en_ast?.parts?.[bookIndex];
  if(!section) return (<h2>Parse failed!!!</h2>);
  const sectionNode = interpreter.interpret(section);
  return (
  <div className="wrapper">
      <Header />
      {sectionNode}
  </div>
  );
}
