import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "./styles.css?url";
import frameStyles from "../frame-full/styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: frameStyles },
    { rel: "stylesheet", href: styles },
];
