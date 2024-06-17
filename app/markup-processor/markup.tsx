import { Link } from "@remix-run/react";
import { ReactNode } from "react";

/***
 * MarkupProcessor: lightweight module for safe and convenient markup conversion into React nodes
 */

enum token {
  Text,
  Link,
  Idiomatic,
  Image,
  Comment,
}

const INIT_INDEX = 1e5; // large number to represent no successful regex match

type NextMatch = {
  tokenType: token;
  captureGroups:  ReturnType<typeof String.prototype.match>;
}

export class MarkupProcessor {
  private readonly linkTransformer: (s: string) => string;
  private readonly source: string;
  private done: boolean = false;
  private result: ReactNode = <p>Parse Error</p>;

  constructor(linkTransformer: (s: string) => string, source: string) {
    this.linkTransformer = linkTransformer;
    this.source = source;
  }

  run(): ReactNode {
    if (!this.done) {
      try {
        this.result = this.process(this.source)
      } catch (e) {
        // do nothing; error indicated by return value
        ;
      } finally {
        this.done = true;
      }
    }
    return this.result;
  }

  private process(section: string): ReactNode {
    // base condition
    if (section === "") return "";
    const {tokenType, captureGroups} = this.match(section);
    let current;
    switch(tokenType) {
      case token.Text: return section;
      case token.Idiomatic:
        current = this.visitIdiomatic(captureGroups![1]);
        break;
      case token.Link:
        current = this.visitLink(captureGroups![1], captureGroups![2]);
        break;
      case token.Image:
        current = this.visitImage(captureGroups![1], captureGroups![2]);
        break;
      case token.Comment:
        current = this.visitComment(captureGroups![1]);
        break;
    }

    const beforeIdx = captureGroups?.index!;
    const afterIdx = beforeIdx + captureGroups![0].length;
    return (<>
      {section.slice(0, beforeIdx)}
      {current}
      {this.process(section.slice(afterIdx, section.length))}
    </>)
  }

  private match(section: string): NextMatch {
    let tokenType=token.Text, captureGroups=null, startIndex=INIT_INDEX, match=null;
    // idiomatic
    match = section.match(MarkupProcessor.idiomaticRx);
    if(match!==null && typeof match.index === "number" && (match.index < startIndex) ) {
      tokenType = token.Idiomatic;
      startIndex = match.index;
      captureGroups = match;
    }
    // image
    match = section.match(MarkupProcessor.imageRx);
    if(match!==null && typeof match.index === "number" && (match.index < startIndex) ) {
      tokenType = token.Image;
      startIndex = match.index;
      captureGroups = match;
    }
    // link
    match = section.match(MarkupProcessor.linkRx);
    if(match!==null && typeof match.index === "number" && (match.index < startIndex) ) {
      tokenType = token.Link;
      startIndex = match.index;
      captureGroups = match;
    }

    // comment
    match = section.match(MarkupProcessor.commentStartRx);
    if(match!==null && typeof match.index === "number" && (match.index < startIndex) ) {
      // find next closing bracket without opening bracket
      let opening = 0, done=false, end=INIT_INDEX;
      // skip first two chars: \^\[
      for (let i = match.index + 2; i < section.length; i++) {
        if(done) break;
        switch (section[i]) {
          case '[':
            opening++;
            break;
          case ']':
            if (opening === 0) {
              done = true;
              end = i;
            } else {
              opening--;
            }
            break;
          default:
            ; // do nothing
            break;
        }
      }
      // duck type a match object using original match return value
      // reference:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
      match[0] = section.slice(match.index, end + 1);
      match[1] = section.slice(match.index + 2, end); // slice until the closing bracket (end-1+1)
      tokenType = token.Comment;
      startIndex = match.index;
      captureGroups = match;
    }

    // done
    return {tokenType, captureGroups};

  }

  private visitIdiomatic(section: string): ReactNode {
    return (<i>{this.process(section)}</i>)
  }

  private visitLink(text: string, address: string): ReactNode {
    const linkTo = this.linkTransformer(address);
    return (
      <Link to={linkTo}>{this.process(text)}</Link>
    )
  }

  private visitImage(text: string, address: string): ReactNode {
    return (
      <>
{/* <img src={address} alt={text} /> */}
        <label>{text}</label>
</>
    )
  }

  private visitComment(section: string): ReactNode {
    return (
    <cite>
    {this.process(section)}
    </cite>
    )
  }
  static linkRx = /\[([^\]]+)\]\(([\w\s]+)\)/;

  // do not support nesting
  static idiomaticRx = /_([^_]*)_/;

  static imageRx = /!\[([^\[\]]+)\]\(([^\)]+)\)/;

  static commentStartRx = /\^\[/;

}
