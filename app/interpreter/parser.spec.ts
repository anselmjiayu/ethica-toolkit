import { expect, test } from "vitest";

const indexRx = /\[[^\]]+\]\(([\w\s]+)\)/g;
const linkLiteral = "outer text[link1](101) some more text [link2](102)"
const imgLinkLiteral = "outer text![Graph 1](/assets/img/graph-01.png) some more text [link2](102)"

test("that links are indexed correctly", () => {
  const indexMatches = [...linkLiteral.matchAll(indexRx)];
  expect(indexMatches).toHaveLength(2);
  expect(indexMatches[0]).toHaveLength(2);
  expect(indexMatches[0][1]).toBe("101")
  expect(indexMatches[1][0]).toBe("[link2](102)")
  expect(indexMatches[1][1]).toBe("102")
  const imgLinkMatches = [...imgLinkLiteral.matchAll(indexRx)];
  expect(imgLinkMatches).toHaveLength(1);
  expect(imgLinkMatches[0][1]).toBe("102")

  const refMap = new Map(Array.from(linkLiteral.matchAll(indexRx),
  (match, idx) => [idx, match[1]]));
  expect(refMap.get(0)).toBe("101");
  expect(refMap.get(1)).toBe("102");

})

