import { useState } from "react";

type HeaderThemes = "light" | "dark" | "system";
type EventHandler = () => void;
type HeaderHandlers = {
  onLightTheme: EventHandler,
  onDarkTheme: EventHandler,
  onSystemTheme: EventHandler,
  onShowHint: EventHandler,
}

export function Header({theme, show, eventHandlers}: {theme: HeaderThemes, show: boolean, 
  eventHandlers: HeaderHandlers}) {

  // opimistic ui
  const [optTheme, setOptTheme] = useState(theme);

  const onLightTheme = () => {
    setOptTheme("light");
    eventHandlers.onLightTheme();
  }

  const onDarkTheme = () => {
    setOptTheme("dark");
    eventHandlers.onDarkTheme();
  }

  const onSystemTheme = () => {
    setOptTheme("system");
    eventHandlers.onSystemTheme();
  }

  return(
        <header className={"navbar " + optTheme + (show === true ? "" : " display-hide") } top-banner="true">
          <h2 className="title">Ethica</h2>
          <details className={optTheme}>
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
              <li>
                <button id="header-show-key-binding-button" onClick={eventHandlers.onShowHint}>
                  Key bindings
                </button>
              </li>
              <li>About</li>
            </ul>
          </details>
        </header>
  )
}

