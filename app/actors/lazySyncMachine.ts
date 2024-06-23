import { assign, setup } from "xstate";
import { instanceMachine } from "./instanceMachine";

// ""raw"" serial data
import en_input from "~/data/spinoza-ethica-en-elwes.json";
import la_input from "~/data/spinoza-ethica-lat-gebhardt.json";

import { ParseResult } from "~/interpreter/parser";
import { createActorContext } from "@xstate/react";

export enum SourceEditions {
  NULL,
  EN_ELWES,
  LA_GEBHARDT,
};

// Fetch and parse serialized source data from server lazily, storing active instances in context

type LazyContext = {
  // Parsed AST
  en_source: ParseResult | undefined,
  la_source: ParseResult | undefined,
  // A register for next serial data to parse
  next_source_type: SourceEditions,
}

export const lazySyncMachine = setup({
  types: {
    events: {} as
    | {type: 'FETCH', edition: SourceEditions}
    | {type: 'RETRY'},
    context: {} as LazyContext,
  },
  actors: {
    instanceMachine
  }
}).createMachine({
  id: 'instanceContext',
  // parse nothing by default
  context: {
    en_source: undefined,
    la_source: undefined,
    next_source_type: SourceEditions.NULL,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        'FETCH': {
          target: 'loading',
          actions: assign({
            next_source_type: ({event}) => event.edition
          })
        }
      }
    },
    loading: {
      // delegate to instanceMachine to process source
      invoke: {
        id: 'loadInstance',
        src: 'instanceMachine',
        input: ({context}) => {
          switch(context.next_source_type) {
            case SourceEditions.EN_ELWES:
              return {source: en_input};
            case SourceEditions.LA_GEBHARDT:
              return {source: la_input};
            case SourceEditions.NULL:
              throw new Error("This should never happen");
          }
        },

        onDone: {
          target: 'idle',
          actions: assign(({event, context}) => {
            switch(context.next_source_type) {
              case SourceEditions.EN_ELWES:
                return {en_source: event.output.parseResult};
              case SourceEditions.LA_GEBHARDT:
                return {la_source: event.output.parseResult};
              case SourceEditions.NULL:
                return {};
            }
          })
        },
        onError: {
          target: 'error',
        }
      }
    },
    error: {
      on: {
        'RETRY': {
          target: 'loading',
        }
      }
    }
  }
})

export const LazySyncContext = createActorContext(lazySyncMachine);
