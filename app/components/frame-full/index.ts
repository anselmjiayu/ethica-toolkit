import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "./styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];
