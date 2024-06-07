import { Link } from "@remix-run/react";
import { ReactNode } from "react";

/***
 * MarkupProcessor: lightweight module for safe and convenient markup conversion into React nodes
 */

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

    // Match for idiomatic or link markup, find which one begins earlier, then recurse
    const matchIdiomatic = section.match(MarkupProcessor.idiomaticRx);
    const matchLink = section.match(MarkupProcessor.linkRx);
    if (matchIdiomatic === null && matchLink === null) return section;
    else if (matchLink === null || (matchIdiomatic !== null && matchLink.index! > matchIdiomatic.index!)) {
      // at this branch matchIdiomatic must exist and have priority
      // process idiomatic

      // since matchIdiomatic returns a match, the index is guaranteed to exist
      // the test code asserts correctness of the expression matching
      const beforeIdx = matchIdiomatic!.index!;
      const afterIdx = beforeIdx + matchIdiomatic![0].length;
      const idiomaticCapture = matchIdiomatic![1];
      return (<>
        {section.slice(0, beforeIdx)}
        {this.visitIdiomatic(idiomaticCapture)}
        {this.process(section.slice(afterIdx, section.length))}
      </>)
    } else {
      // matchIdiomatic === null || matchLink.index < matchIdiomatic.index
      const beforeIdx = matchLink!.index!;
      const afterIdx = beforeIdx + matchLink![0].length;
      const textCapture = matchLink![1];
      const addressCapture = matchLink![2];
      return (<>
        {section.slice(0, beforeIdx)}
        {this.visitLink(textCapture, addressCapture)}
        {this.process(section.slice(afterIdx, section.length))}
      </>)
    }
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

  static linkRx = /\[([^\]]+)\]\(([\w\s]+)\)/;

  // do not support nesting
  static idiomaticRx = /_([^_]*)_/;

}
