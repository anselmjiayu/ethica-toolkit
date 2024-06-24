import { ActionFunctionArgs, json, type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import HomePage from "~/components/HomePage";
import RenderContents from "~/components/RenderContents";

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
  let { theme } = useLoaderData<typeof loader>();

  const onLight = () => fetcher.submit({ theme: "light" }, { method: 'POST' })
  const onDark = () => fetcher.submit({ theme: "dark" }, { method: 'POST' })
  const onSystem = () => fetcher.submit({ theme: "system" }, { method: 'POST' })

  const headerHandlers = {
    onLightTheme: onLight,
    onDarkTheme: onDark,
    onSystemTheme: onSystem,
    onShowHint: () => { },
  }
  return (
    <>
      <Header
        theme={theme}
        show={true}
        eventHandlers={headerHandlers}
      />
      <div className="wrapper">
        <HomePage />
      </div>
    </>
  );
}
