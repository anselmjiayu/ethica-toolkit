import { expect, test } from "vitest";

// matches link format in string literal: (text)[index]
const linkRx = /\[([^\]]+)\]\(([\w\s]+)\)/;

const italicsRx = /_(.*)_/;

const imageRx = /!\[([^\[\]]+)\]\(([^\)]+)\)/;

const commentRx = /\^\[([^\[\]]+)\]/; // what goes inside the capture group?

test("that the regular expression matches greedily to the largest match",
  () => {
    const matchNestedIdiomatic = "_outer_inner_outer_".match(italicsRx);
    expect(matchNestedIdiomatic).toHaveLength(2);
    const innerMatch = matchNestedIdiomatic?.[0];
    expect(innerMatch).toBe("_outer_inner_outer_");
    const innerCapture = matchNestedIdiomatic?.[1];
    expect(innerCapture).toBe("outer_inner_outer");
    const matchInner = innerCapture!.match(italicsRx);
    expect(matchInner![1]).toBe("inner");

    const openingLiteral = 
      "ETHICA Ordine Geometrico demonstrata _ET_ _In quinque Partes distincta_ _in quibus agitur,_" + '\n';

    const openingLiteralCapture = openingLiteral.match(italicsRx)![1];
    expect(openingLiteralCapture).toBe("ET_ _In quinque Partes distincta_ _in quibus agitur,");

  })


const idiomaticRx = /_([^_]*)_/;
test("that the idiomatic expression matches correctly",
()=> {
    const literal = "_Things which have nothing in common cannot be one the cause of the other._";
    const match = literal.match(idiomaticRx);
    expect(match).toHaveLength(2);
    expect(match?.index).toBe(0);
    expect(match?.[1]).toBe("Things which have nothing in common cannot be one the cause of the other.")
  })

test("that the link expression matches correctly",
  () => {
    const linkLiteral = "outer text[link1](101) some more text [link2](102)"
    const matchLink = linkLiteral.match(linkRx);
    expect(matchLink).toHaveLength(3);
    expect(matchLink![1]).toBe("link1");
    expect(matchLink).toHaveProperty("index");
    expect(matchLink?.index).toBe(10); // start of "[link1]"
    expect(linkLiteral.slice(matchLink?.index! + matchLink![0].length))
    .toBe(" some more text [link2](102)");

  })


test("that the image expression matches correctly",
 () => {
    const imgLinkLiteral = "outer text![Graph 1](/assets/img/graph-01.png) some more text [link2](102)"
    const matchLink = imgLinkLiteral.match(imageRx);
    expect(matchLink).toHaveLength(3);
    expect(matchLink![1]).toBe("Graph 1");
    expect(matchLink![2]).toBe("/assets/img/graph-01.png");
    expect(matchLink).toHaveProperty("index");
    expect(matchLink?.index).toBe(10); // start of "![Graph 1]"
    expect(imgLinkLiteral.slice(matchLink?.index! + matchLink![0].length))
    .toBe(" some more text [link2](102)");
  })
