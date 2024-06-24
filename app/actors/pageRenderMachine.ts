import { assertEvent, assign, raise, setup } from "xstate";
import { IndexCollection } from "~/interpreter/parser";
import { Source } from "~/types/Stmt";
import { labelMachine } from "./labelMachine";

// state information stored in page interface
type PageContext = {
  sourceAst: Source,
  indexMap: IndexCollection,
  // retrieve label id by position
  indexLookup: Map<number, string>,
  // retrieve position by label id
  positionLookup: Map<string, number>,
  currentPosition: number | undefined,
  // amount of labels on the page
  numLabels: number,
}

function indexLookupHelper(indexMap: IndexCollection): Map<number, string> {
  // use iterator order to extract index order from index map
  // Maps iterate in insertion order: 
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#objects_vs._maps
  // each entry is a [key, value] pair
  // IndexCollection = Map<string, {label, refs}> thus item[0] extracts the index string
  return new Map(Array.from(indexMap, (item, index) => [index, item[0]]))
}

function positionLookupHelper(indexLookup: Map<number, string>): Map<string, number> {
  return new Map(Array.from(indexLookup, (item) => [item[1], item[0]]))
}

// specify keyboard events processed by the render machine actor
export enum KBD_INPUT {
  A,
  D,
  B,
  F,
  R,
  J,
  K,
  HELP,
  ESC,
  ENTER,
  BACKSLASH,
};

export const pageRenderMachine = setup({
  types: {
    context: {} as PageContext,
    events: {} as
    | { type: 'TOGGLE_MODAL' }
    | { type: 'NEXT_LABEL' }
    | { type: 'PREV_LABEL' }
    | { type: 'JMP', offset: number }
    | { type: 'GOTO', position: number }
    | { type: 'FOCUS_LABEL', index: string }
    | { type: 'UNFOCUS_LABEL' }
    | { type: 'CLEAR_LABEL_REF' }
    | { type: 'CLEAR_ALL_REF' }
    | { type: 'INPUT', key: KBD_INPUT }
    | {type: 'NOOP'}
    ,
    input: {} as {
      source: Source,
      indexMap: IndexCollection,
    }
  },
  guards: {
    validPosition: ({ event, context }) => {
      assertEvent(event, 'GOTO');
      return event.position >= 0 && event.position < context.numLabels;
    },
    hasPosition: ({context}) => context.currentPosition !== undefined,
    noPosition: ({context}) => context.currentPosition === undefined,
  },
  actors: { labelMachine },
}).createMachine({
  initial: 'normal',
  context: ({ input }) => {
    const indexLookup = indexLookupHelper(input.indexMap);
    const positionLookup = positionLookupHelper(indexLookup);
    return {
      sourceAst: input.source,
      indexMap: input.indexMap,
      indexLookup,
      positionLookup,
      currentPosition: undefined,
      numLabels: indexLookup.size,
    }
  },
  states: {
    normal: {
      initial: 'inactive',
      on: {
        INPUT: {
          actions: raise(({event}) => {
            switch(event.key) {
              case KBD_INPUT.HELP:
              return {type: 'TOGGLE_MODAL'};
              default:
              return {type: 'NOOP'}
            }
          })
        },
        TOGGLE_MODAL: {
          target: 'modal',
        }
      },
      states: {
        // has label focus
        active: {
          on: {
            UNFOCUS_LABEL: {
              guard: 'noPosition',
              target: 'inactive',
              actions: assign({
                currentPosition: undefined,
              })
            },
            NEXT_LABEL: {
              actions: raise({type: 'JMP', offset: +1})
            },
            PREV_LABEL: {
              actions: raise({type: 'JMP', offset: -1})
            },
            JMP: {
              actions: raise(({event, context}) => ({
                type: 'GOTO', position: context.currentPosition! + event.offset
              }))
            },
            GOTO: {
              // CONSIDERED HARMFUL
              guard: 'validPosition',
              actions: assign(({event, context}) => {
                let position = event.position;
                if (position < 0) position = 0;
                if (position >= context.numLabels) position = context.numLabels;
                return {
                  currentPosition: position
                };
              })
            }
          }
        },
        // no label focus
        inactive: {
          on: {
            FOCUS_LABEL: {
              guard: 'hasPosition',
              target: 'active',
              actions: assign({
                currentPosition: ({ event, context }) =>
                  context.positionLookup.get(event.index),
              })
            }
          }

        },
        // history state
        hist: {
          type: 'history'
        }
      }
    },
    modal: {
      on: {
        INPUT: {
          actions: raise(({event}) => {
            switch(event.key) {
              case KBD_INPUT.ESC:
              return {type: 'TOGGLE_MODAL'};
              default:
              return {type: 'NOOP'}
            }
          })
        },
        TOGGLE_MODAL: {
          // restore last active normal state
          target: 'normal.hist'
        }
      }
    }
  }
})

export type PageRenderMachine = typeof pageRenderMachine;
