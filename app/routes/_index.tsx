import type { LinksFunction, MetaFunction } from "@remix-run/node";
import HomePage from "~/components/HomePage";
import RenderContents from "~/components/RenderContents";

export const meta: MetaFunction = () => {
  return [
    { title: "Ethics" },
    { name: "description", content: "Ethics by Benedictus de Spinoza" },
  ];
};
import { links as frameLinks } from "~/components/frame-full";
import { prefs } from "~/components/header/prefs-cookie";

export const links: LinksFunction = () => [
    ...frameLinks(),
];

export default function Index() {
  return (
    <div className="wrapper">
      <HomePage />
    </div>
  );
}
