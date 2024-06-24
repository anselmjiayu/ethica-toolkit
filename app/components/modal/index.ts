import { LinksFunction } from "@remix-run/node";

import styles from "./styles.css?url";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles },
];
