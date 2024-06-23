import { assign, setup } from "xstate";

import { InputObject, Scanner } from "~/interpreter/scanner";
import { ParseResult, Parser } from "~/interpreter/parser";
import { createActorContext } from "@xstate/react";

type InstanceContext = {
  source: InputObject,
  scanner: Scanner,
  parser: Parser | undefined,
  parseResult: ParseResult | undefined,
}

export const instanceMachine = setup({
  types: {
    context: {} as InstanceContext,
    input: {} as { source: InputObject },
    output: {} as { parseResult: ParseResult }
  },
  guards: {
    parserInitialized: ({ context }) => {
      return context.parser !== undefined;
    },
    parseCompleted: ({ context }) => {
      return context.parseResult !== undefined;
    }
  },
  actions: {
    setParser: assign(({ context }) =>{
      const tokens = context.scanner.run();
      
      // turn on indexing flag in the parser
      return { parser: new Parser(tokens, true) }
    }),
    setAst: assign(({ context }) =>{
      const parseResult = context.parser?.parse();
      return { parseResult }
    }),
  },
}).createMachine({
  context: ({ input }) => ({
    source: input.source,
    scanner: new Scanner(input.source),
    parser: undefined,
    parseResult: undefined,
  }),
  initial: 'lexing',
  states: {
    lexing: {
      entry: [{type: 'setParser'}],
      always: {
        guard: 'parserInitialized',
        target: 'parsing',
      }
    },
    parsing: {
      entry: [{ type: 'setAst'}],
      always: {
        guard: 'parseCompleted',
        target: 'loaded',
      }
    },
    loaded: {
      type: 'final'
    }
  },
  output: ({context}) => {
    if (context.parseResult === undefined) throw new Error("this should never happen");
    return {
    parseResult: context.parseResult
  }}
})

export default createActorContext(instanceMachine);
