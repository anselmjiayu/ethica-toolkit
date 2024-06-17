import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { links as frameLinks } from "~/components/frame-full";
import { prefs } from "~/components/header/prefs-cookie";

export const links: LinksFunction = () => [
    ...frameLinks(),
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
    anchorPrefix: "",
}

const interpreter = new Interpreter(defaultInterpreterStyles, config);
export default function ENPartPage() {
  const partIndex = useLoaderData<typeof loader>();
  
  const section = en_ast?.parts?.[partIndex];
  if(!section) return (<h2>Parse failed!!!</h2>);
  const sectionNode = interpreter.interpret(section);
  return (
  <div className="wrapper">
      <Navigate section={partIndex}/>
      {sectionNode}
      <Navigate section={partIndex}/>
  </div>
  );
}

function Navigate({section}: {section: number}) {
  return (<nav>
    <Link to={"/en/"+(section -1)}>{"<<"}</Link>
    <Link to={"/en/"+(section +1)}>{">>"}</Link>
  </nav>)
}
