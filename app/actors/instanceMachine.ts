import { assign, setup } from "xstate";

import { InputObject, Scanner } from "~/interpreter/scanner";
import { ParseResult, Parser } from "~/interpreter/parser";
import { createActorContext } from "@xstate/react";

type InstanceContext = {
  source: InputObject,
  scanner: Scanner,
  parser: Parser | undefined,
  ast: ParseResult | undefined,
}

export const instanceMachine = setup({
  types: {
    context: {} as InstanceContext,
    input: {} as { source: InputObject },
    output: {} as { ast: ParseResult }
  },
  guards: {
    parserInitialized: ({ context }) => {
      return context.parser !== undefined;
    },
    parseCompleted: ({ context }) => {
      return context.ast !== undefined;
    }
  },
  actions: {
    setParser: assign(({ context }) =>{
      const tokens = context.scanner.run();
      return { parser: new Parser(tokens) }
    }),
    setAst: assign(({ context }) =>{
      const ast = context.parser?.parse();
      return { ast }
    }),
  },
}).createMachine({
  context: ({ input }) => ({
    source: input.source,
    scanner: new Scanner(input.source),
    parser: undefined,
    ast: undefined,
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
  output: ({context}) => ({
    ast: context.ast,
  })
})

export default createActorContext(instanceMachine);
