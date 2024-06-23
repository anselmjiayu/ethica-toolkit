import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Interpreter, InterpreterConfig } from "~/interpreter/interpreter";
import { defaultInterpreterStyles } from "~/styles/default_interpreter_style";
import { links as frameLinks } from "~/components/frame-view";
import { LazySyncContext, SourceEditions } from "~/actors/lazySyncMachine";
import { en_ast } from "~/runtime/en_elwes_instance";
import { la_ast } from "~/runtime/la_gebhardt_instance";

export const links: LinksFunction = () => [
    ...frameLinks(),
];

export function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const view1 = url.searchParams.get("view1") || "la";
    const part1 = url.searchParams.get("part1") || "1";

    const view2 = url.searchParams.get("view2") || "en";
    const part2 = url.searchParams.get("part2") || "1";
    return { view1, part1, view2, part2 };
}

const CURRENT_PAGE = 0;
const transformLinkCreator = (prefix: string, paramsProducer: (part: number) => string) =>(source: string) => {
    const part = Number.parseInt(source[0]);
    if (isNaN(part)) return "/view/" + paramsProducer(CURRENT_PAGE)+ "#" + prefix + source;
    return "/view/" + paramsProducer(part) + "#" + prefix + source;
}

const configCreator = (prefix: string, paramsProducer: (part: number) => string): InterpreterConfig => ({
    linkBuilder: transformLinkCreator(prefix, paramsProducer),
    anchorPrefix: prefix,
})


const part_rx = /^[1-5]$/;

export default function ViewSplit() {

  const syncMachineRef = LazySyncContext.useActorRef();

  function getAstBranch(view: string, part: string) {
    // provide default params
    let a = view === "en" ? LazySyncContext.useSelector(state => state.context.en_source) 
      : LazySyncContext.useSelector(state => state.context.la_source);
    if (a === undefined) {
      switch(view) {
        case "en":
          syncMachineRef.send({type: 'FETCH', edition: SourceEditions.EN_ELWES});
          // provide SSR
          a = en_ast;
          break;
        default:
          syncMachineRef.send({type: 'FETCH', edition: SourceEditions.LA_GEBHARDT});
          // provide SSR
          a = la_ast;
      }
    }
    const idx = part.match(part_rx) ? Number.parseInt(part) : 1;

    return a?.parts[idx] || undefined;
  }

    const { view1, view2, part1, part2 } = useLoaderData<typeof loader>();
    const ast1 = getAstBranch(view1, part1);
    const ast2 = getAstBranch(view2, part2);

  // create interpreters with variables in closure

  const interpreter1ParamsProducer = (part: number) => {
    const next = part===CURRENT_PAGE ? part1 : part;
    return `?view1=${view1}&view2=${view2}&part1=${next}&part2=${part2}`;
  }
  const interpreter2ParamsProducer = (part: number) => {
    const next = part===CURRENT_PAGE ? part2 : part;
    return `?view1=${view1}&view2=${view2}&part1=${part1}&part2=${next}`;
  }

  const interpreter1 = new Interpreter(defaultInterpreterStyles, configCreator(view1, interpreter1ParamsProducer));
  const interpreter2 = new Interpreter(defaultInterpreterStyles, configCreator(view2, interpreter2ParamsProducer));
  const errorNode = (<h2>Something went wrong!</h2>);
  const sectionNode1 = ast1 !== undefined ? interpreter1.interpret(ast1) : errorNode;
  const sectionNode2 = ast2 !== undefined ? interpreter2.interpret(ast2) : errorNode;

    return (
        <div className="view-wrapper">
            <div className="placeholder"/>
            <div className="wrapper view view1">{sectionNode1}</div>
            <div className="separator"/>
            <div className="wrapper view view2">{sectionNode2}</div>
        </div>
    )
}
