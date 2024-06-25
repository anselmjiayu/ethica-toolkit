import { ActionFunctionArgs, json, type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Theme, ThemeContext } from "~/actors/themeMachine";
import HomePage from "~/components/HomePage";

export const meta: MetaFunction = () => {
  return [
    { title: "Ethics" },
    { name: "description", content: "Ethics by Benedictus de Spinoza" },
  ];
};
import { links as frameLinks } from "~/components/frame-full";
import { Header } from "~/components/header/header";
import { prefs } from "~/components/header/prefs-cookie";

export const links: LinksFunction = () => [
  ...frameLinks(),
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



export default function Index() {
  const fetcher = useFetcher();
  let { theme: loaderTheme } = useLoaderData<typeof loader>();

  const onLight = () => fetcher.submit({ theme: "light" }, { method: 'POST' })
  const onDark = () => fetcher.submit({ theme: "dark" }, { method: 'POST' })
  const onSystem = () => fetcher.submit({ theme: "system" }, { method: 'POST' })

  const headerHandlers = {
    onLightTheme: onLight,
    onDarkTheme: onDark,
    onSystemTheme: onSystem,
  }

  const themeActorRef = ThemeContext.useActorRef();

  const [theme, setTheme] = useState("system" as Theme);
  

  themeActorRef.subscribe((snapshot) => {
    setTheme(snapshot.value);
  })

  return (
    <div className={"body"+ " "+ theme}>
      <Header
        show={true}
        eventHandlers={headerHandlers}
      />
      <div className="wrapper">
        <HomePage />
      </div>
    </div>
  );
}
