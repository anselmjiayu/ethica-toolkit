import { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "app/index.css?url";
import { links as headerLinks } from "~/components/header";
import { links as modalLinks } from "~/components/modal";
import { LazySyncContext } from "~/actors/lazySyncMachine";
import { ThemeContext } from "./actors/themeMachine";

export const links: LinksFunction = () => [
  ...headerLinks(),
  ...modalLinks(),
  { rel: "stylesheet", href: styles },
];


export function Layout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeContext.Provider>
      <LazySyncContext.Provider>
        <Outlet />
      </LazySyncContext.Provider>
    </ThemeContext.Provider>
  );
}
