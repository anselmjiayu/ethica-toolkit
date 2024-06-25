import { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useSelector } from "@xstate/react";
import { useEffect, useState } from "react";
import { LazySyncContext, SourceEditions, la_renderMachineSelector } from "~/actors/lazySyncMachine";
import { ShowHeaderSelector, keyEventDispatcherCreator } from "~/actors/pageRenderMachine";
import { Theme, ThemeContext } from "~/actors/themeMachine";
import { links as frameLinks } from "~/components/frame-full";
import { Header } from "~/components/header/header";
import { prefs } from "~/components/header/prefs-cookie";
import ModalRoot from "~/components/modal/ModalRoot";
import ShowHints from "~/components/modal/ShowHints";

export const links: LinksFunction = () => [
  ...frameLinks(),
];

import { Interpreter, InterpreterConfig } from "~/interpreter/interpreter";
import { la_ast } from "~/runtime/la_gebhardt_instance";
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


const foo = () => { };

const headerHandlers = {
  onLightTheme: foo,
  onDarkTheme: foo,
  onSystemTheme: foo,
}

export default function LAPartPage() {
  const partIndex = useLoaderData<typeof loader>();

  // styling
  const themeActorRef = ThemeContext.useActorRef();

  const [theme, setTheme] = useState("system" as Theme);


  themeActorRef.subscribe((snapshot) => {
    setTheme(snapshot.value);
  })

  // this is the global source data state machine
  const syncMachineRef = LazySyncContext.useActorRef();

  // select parsed AST
  let ast = LazySyncContext.useSelector(state => state.context.la_source?.ast);

  if (ast === undefined) {
    // data has not been parsed, attempt to load and parse source
    syncMachineRef.send({ type: "INITIALIZE", themeActor: themeActorRef });
    syncMachineRef.send({ type: "FETCH", edition: SourceEditions.LA_GEBHARDT });
    // pre-parsed AST to support SSR
    ast = la_ast;
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
  // default to header display
  const [showHeader, setShowHeader] = useState(true as boolean);

  const renderMachineRef = useSelector(syncMachineRef, la_renderMachineSelector);

  const toggleModal: () => void = (
    renderMachineRef === undefined
      ? () => { }
      : () => renderMachineRef.send({ type: 'TOGGLE_MODAL' })
  )

  const sendKeyEvent: (event: KeyboardEvent) => void =
    (renderMachineRef === undefined
      ? (_event) => {
        ;
      }
      : keyEventDispatcherCreator(renderMachineRef));

  if (renderMachineRef !== undefined) {
    renderMachineRef.subscribe((snapshot) => {
      setShowModal(snapshot.matches('modal'));
      // delegate header display to renderMachine
      setShowHeader(snapshot.context.showHeader);
    });
    // attach toggle modal function to the "well known" button in header
    const headerHintElement = document.getElementById("header-show-key-binding-button");
    if (headerHintElement) headerHintElement.onclick = toggleModal;

  }

  /***
    listening to keyboard input is a valid use case of useEffect
    see https://react.dev/reference/react/useEffect#connecting-to-an-external-system
    ***/

  // client-only
  useEffect(() => {
    window.addEventListener('keydown', sendKeyEvent);
    // cleanup
    return () => {
      window.removeEventListener('keydown', sendKeyEvent);
    }
    // use dependency array to re-attach listeners on page refresh
  }, [renderMachineRef])

  return (
    <div className={"body" + " " + theme}>
      <Header
        show={showHeader}
        eventHandlers={headerHandlers}
      />
      <div className="wrapper">
        <Navigate section={partIndex} />
        {sectionNode}
        <Navigate section={partIndex} />
      </div>
      {/* place modal after main content to reduce layout shift */}
      <ModalRoot show={showModal} handleClose={toggleModal}>
        <ShowHints />
      </ModalRoot>
    </div>
  );
}

function Navigate({ section }: { section: number }) {
  return (<nav className="part-nav">
    <div className="nav-link">
      {section === 1 ? <span>Start</span> : <Link to={"/la/" + (section - 1)}>{"<<"}</Link>}
    </div>

    <div className="nav-link">
      <Link to={"/"}>Home</Link>
    </div>

    <div className="nav-link">
      {section === 5 ? <span>End</span> : <Link to={"/la/" + (section + 1)}>{">>"}</Link>}
    </div>
  </nav>)
}
