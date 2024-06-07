import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "./styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export function Header() {
  return (
<header className="navbar" top-banner="true">
      <h2>Ethica</h2>
      <details>
        <summary>theme</summary>
        <ul>
          <li>Light</li>
          <li>Dark</li>
          <li>System</li>
        </ul>
      </details>
      <details>
        <summary>
          options
        </summary>
        <ul>
          <li>Edition</li>
          <li>Key bindings</li>
          <li>About</li>
        </ul>
      </details>
    </header>
  )
}
