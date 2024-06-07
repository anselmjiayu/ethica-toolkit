import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Header, links as headerLinks} from "~/components/header";

export const links: LinksFunction = () => [
  ...headerLinks(),
];

import { Interpreter, InterpreterConfig } from "~/interpreter/interpreter";
import { en_ast } from "~/runtime/en_elwes_instance";
import { defaultInterpreterStyles } from "~/styles/default_interpreter_style";

export function loader({params}: LoaderFunctionArgs) {
  // If index does not fall into 1-5, default to 1
  return params.part?.match(/^[1-5]$/) ? Number.parseInt(params.part) : 1;
}

function transformLink(source: string): string {
  const part = Number.parseInt(source[0]);
  if (isNaN(part)) return "#" + source;
  return "/en/" + part.toString() + "/#" + source;
}

const config: InterpreterConfig = {
  linkBuilder: transformLink,
}

const interpreter = new Interpreter(defaultInterpreterStyles, config);
export default function ENPartPage() {
  const partIndex = useLoaderData<typeof loader>();
  
  const section = en_ast?.parts?.[partIndex];
  if(!section) return (<h2>Parse failed!!!</h2>);
  const sectionNode = interpreter.interpret(section);
  return (
  <div className="wrapper">
      <Header />
      {sectionNode}
  </div>
  );
}
