import type { MetaFunction } from "@remix-run/node";
import {Header} from "~/components/header";
import RenderContents from "~/components/RenderContents";

export const meta: MetaFunction = () => {
  return [
    { title: "Ethics" },
    { name: "description", content: "Ethics by Benedictus de Spinoza" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "junicode, system-ui, serif", lineHeight: "1.8" }}>
      <Header />
      <RenderContents />
    </div>
  );
}
