import { useState } from "react";
import { ThemeContext } from "~/actors/themeMachine";

import { Theme } from "~/actors/themeMachine";
type EventHandler = () => void;
export type HeaderHandlers = {
  onLightTheme: EventHandler,
  onDarkTheme: EventHandler,
  onSystemTheme: EventHandler,
  onShowHint?: EventHandler,
}

export function Header({ show, eventHandlers }: {
  show: boolean,
  eventHandlers: HeaderHandlers
}) {

  const themeActorRef = ThemeContext.useActorRef();

  const [theme, setTheme] = useState("system" as Theme);

  themeActorRef.subscribe((snapshot) => {
    setTheme(snapshot.value);
  })

  const onLightTheme = () => {
    themeActorRef.send({ type: 'LIGHT' });
    eventHandlers.onLightTheme();
  }

  const onDarkTheme = () => {
    themeActorRef.send({ type: 'DARK' });
    eventHandlers.onDarkTheme();
  }

  const onSystemTheme = () => {
    themeActorRef.send({ type: 'SYSTEM' });
    eventHandlers.onSystemTheme();
  }


  return (
    <header className={"navbar " + theme + (show === true ? "" : " display-hide")} top-banner="true">
      <h2 className="title">Ethica</h2>
      <details className={theme}>
        <summary>theme</summary>
        <ul className="option-menu">
          <li>
            <button name="theme" value="light" onClick={onLightTheme}>
              Light
            </button>
          </li>
          <li>
            <button name="theme" value="dark" onClick={onDarkTheme}>
              Dark
            </button>
          </li>
          <li>
            <button name="theme" value="system" onClick={onSystemTheme}>
              System
            </button>
          </li>
        </ul>
      </details>
      <details className={theme}>
        <summary>
          options
        </summary>
        <ul className="option-menu">
          <li>Edition</li>
          {
            eventHandlers.onShowHint !== undefined &&
              <li>
                <button id="header-show-key-binding-button" onClick={eventHandlers.onShowHint}>
                  Key bindings
                </button>
              </li>
          }
          <li>About</li>
        </ul>
      </details>
    </header>
  )
}

