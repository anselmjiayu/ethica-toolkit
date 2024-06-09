import { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";

import styles from "app/index.css?url";
import { links as headerLinks } from "~/components/header";
import { prefs } from "./components/header/prefs-cookie";

export const links: LinksFunction = () => [
    ...headerLinks(),
    { rel: "stylesheet", href: styles },
];

export async function loader({
    request,
}: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ theme: cookie.theme });
}

export async function action({
    request,
}: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    const formData = await request.formData();

    const theme = formData.get("theme");
    cookie.theme = theme;

    return json(theme, {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}

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
                <Header />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}


// the header sets application-wide state and belongs in the root
function Header() {
    const fetcher = useFetcher();
    let prefs = useLoaderData<typeof loader>();
    // default theme
    let theme = prefs.theme || "light";

    return (
        <header className={"navbar " + theme} top-banner="true">
            <h2>Ethica</h2>
            <details>
                <summary>theme</summary>
                <ul className="option-menu">
                    <li>
                        <fetcher.Form method="post">
                            <button name="theme" value="light">
                                Light
                            </button>
                        </fetcher.Form>
                    </li>
                    <li>
                        <fetcher.Form method="post">
                            <button name="theme" value="dark">
                                Dark
                            </button>
                        </fetcher.Form>
                    </li>
                    <li>
                        <fetcher.Form method="post">
                            <button name="theme" value="system">
                                System
                            </button>
                        </fetcher.Form>
                    </li>
                </ul>
            </details>
            <details>
                <summary>
                    options
                </summary>
                <ul className="option-menu">
                    <li>Edition</li>
                    <li>Key bindings</li>
                    <li>About</li>
                </ul>
            </details>
        </header>
    )
}

export default function App() {
  return <Outlet />;
}
