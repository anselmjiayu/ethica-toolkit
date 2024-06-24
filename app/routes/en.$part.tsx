import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { links as frameLinks } from "~/components/frame-full";
import { LazySyncContext, RenderMode, SourceEditions, en_renderMachineSelector } from "~/actors/lazySyncMachine";

// Redundancy to support rendering without JS and potentially improve initial load cost
import { en_ast } from "~/runtime/en_elwes_instance";
import ModalRoot from "~/components/modal/ModalRoot";
import ShowHints from "~/components/modal/ShowHints";
import { useSelector } from "@xstate/react";

// utility types for machine actors
import type { PageRenderMachine } from "~/actors/pageRenderMachine";
import type { SnapshotFrom } from "xstate";

export const links: LinksFunction = () => [
  ...frameLinks(),
];

import { Interpreter, InterpreterConfig } from "~/interpreter/interpreter";
import { defaultInterpreterStyles } from "~/styles/default_interpreter_style";
import { useState } from "react";

export function loader({ params }: LoaderFunctionArgs) {
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

  // this is the global source data state machine
  const syncMachineRef = LazySyncContext.useActorRef();

  // select parsed AST
  let ast = LazySyncContext.useSelector(state => state.context.en_source?.ast);
  let mode: RenderMode = RenderMode.Client;

  if (ast === undefined) {
    // data has not been parsed, attempt to load and parse source
    syncMachineRef.send({ type: "FETCH", edition: SourceEditions.EN_ELWES});
    ast = en_ast;
    mode = RenderMode.Server;
  }

  // get current part/branch
  const section = ast?.parts?.[partIndex];

  if (!section) return (
    // there is no data, nothing left to do
    <div className="wrapper">
    <h2>500</h2>
    <h3>An error happened...</h3>
    </div>);

  const sectionNode = interpreter.interpret(section);

  // if render machine is not available, do not show modal window
  const [showModal, setShowModal] = useState(false as boolean)

  const renderMachineRef = useSelector(syncMachineRef, en_renderMachineSelector);

  const renderMachineSnapshot: SnapshotFrom<PageRenderMachine> | undefined 
    = renderMachineRef !== undefined 
      ? renderMachineRef.getSnapshot() 
      // if not available, do nothing
      : undefined; 

  const toggleModal: ()=> void = (
    renderMachineRef === undefined
    ? () => {}
    : () => renderMachineRef.send({type: 'TOGGLE_MODAL'})
  )

  if (renderMachineRef !== undefined) {
    renderMachineRef.subscribe((snapshot) => {
      setShowModal(snapshot.matches('modal'));
    });
    // attach toggle modal function to the "well known" button in header
    const headerHintElement = document.getElementById("header-show-key-binding-button");
    if (headerHintElement) headerHintElement.onclick = toggleModal;
  }

  return (
    <>
    <ModalRoot show={showModal} handleClose={toggleModal}>
        <ShowHints />
    </ModalRoot>
    <div className="wrapper">
      <Navigate section={partIndex} />
        <button onClick={toggleModal}>Show key bindings</button>
      {sectionNode}
      <Navigate section={partIndex} />
    </div>
    </>
  );
}

function Navigate({ section }: { section: number }) {
  return (<nav className="part-nav">
    <div className="nav-link">
      {section === 1 ? <span>Start</span> : <Link to={"/en/" + (section - 1)}>{"<<"}</Link>}
    </div>

    <div className="nav-link">
      <Link to={"/"}>Home</Link>
    </div>

    <div className="nav-link">
      {section === 5 ? <span>End</span> : <Link to={"/en/" + (section + 1)}>{">>"}</Link>}
    </div>
  </nav>)
}
