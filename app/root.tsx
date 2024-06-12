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

// save preferences in cookie to for persistent state

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

// The header is included in this element
export function Layout({ children }: { children: React.ReactNode }) {
    const fetcher = useFetcher();
    let { theme } = useLoaderData<typeof loader>();

    // use optimistic ui to update the change immediately
    if (fetcher.formData?.has("theme")) {
        theme = fetcher.formData.get("theme");
    }
    // default
    if (!theme) theme = "system";

    // optimistic ui synchronization requires form element to be included here,
    // to factor out the header both the fetcher and the theme need to be passed in
    // having a large element seems to be the simpler alternative
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className={theme}>
                <header className={"navbar " + theme} top-banner="true">
                    <h2 className="title">Ethica</h2>
                    <details className={theme}>
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
                    <details className={theme}>
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

                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}



export default function App() {
    return <Outlet />;
}
