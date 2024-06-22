import { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { LazySyncContext, SourceEditions } from "~/actors/lazySyncMachine";
import { links as frameLinks } from "~/components/frame-full";
import { prefs } from "~/components/header/prefs-cookie";

export const links: LinksFunction = () => [
    ...frameLinks(),
];

import { Interpreter, InterpreterConfig } from "~/interpreter/interpreter";
import { defaultInterpreterStyles } from "~/styles/default_interpreter_style";

export function loader({ params }: LoaderFunctionArgs) {
    // If index does not fall into 1-5, default to 1
    return params.part?.match(/^[1-5]$/) ? Number.parseInt(params.part) : 1;
}

const transformLink = (link: string): string => {
    const part = Number.parseInt(link[0]);
    if (isNaN(part)) return "#" + link;
    return "/la/" + part.toString() + "/#" + link;
}

const config: InterpreterConfig = {
    linkBuilder: transformLink,
    anchorPrefix: "",
}

const interpreter = new Interpreter(defaultInterpreterStyles, config);
export default function LAPartPage() {
  const partIndex = useLoaderData<typeof loader>();

  // this is the global source data state machine
  const syncMachineRef = LazySyncContext.useActorRef();
  
  // select parsed AST
  const ast = LazySyncContext.useSelector(state => state.context.la_source);

  if (ast === undefined) {
    // data has not been parsed, attempt to load and parse source
    syncMachineRef.send({ type: "FETCH", edition: SourceEditions.LA_GEBHARDT});
  }

  // get current part/branch
  const section = ast?.parts?.[partIndex];

  if (!section) return (
    // there is no data, nothing left to do
    <div className="wrapper">
    <h2>Loading...</h2>
    </div>);

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
  return (<nav className="part-nav">
    <div className="nav-link">
    {section === 1 ? <span>Start</span> : <Link to={"/la/"+(section -1)}>{"<<"}</Link>}
    </div>

    <div className="nav-link">
    <Link to={"/"}>Home</Link>
    </div>

    <div className="nav-link">
    {section === 5 ? <span>End</span> : <Link to={"/la/"+(section +1)}>{">>"}</Link>}
    </div>
  </nav>)
}
