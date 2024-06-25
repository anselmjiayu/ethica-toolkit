import { ActorRefFrom, SnapshotFrom, assertEvent, assign, raise, setup } from "xstate";
import { IndexCollection } from "~/interpreter/parser";
import { Source } from "~/types/Stmt";
import { labelMachine } from "./labelMachine";
import { ThemeMachine } from "./themeMachine";

// state information stored in page interface
type PageContext = {
  sourceAst: Source,
  themeActor: ActorRefFrom<ThemeMachine>,
  indexMap: IndexCollection,
  // retrieve label id by position
  indexLookup: Map<number, string>,
  // retrieve position by label id
  positionLookup: Map<string, number>,
  currentPosition: number | undefined,
  // amount of labels on the page
  numLabels: number,
  // toggle header display
  showHeader: boolean,
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
  H,
  R,
  J,
  K,
  HELP,
  ESC,
  ENTER,
  BACKSLASH,
  SHIFT_R,
};

export const pageRenderMachine = setup({
  types: {
    context: {} as PageContext,
    events: {} as
      | { type: 'TOGGLE_MODAL' }
      | { type: 'TOGGLE_HEADER' }
      | { type: 'INVERT_COLORS' }
      | { type: 'NEXT_LABEL' }
      | { type: 'PREV_LABEL' }
      | { type: 'JMP', offset: number }
      | { type: 'GOTO', position: number }
      | { type: 'FOCUS_LABEL', index: string }
      | { type: 'UNFOCUS_LABEL' }
      | { type: 'CLEAR_LABEL_REF' }
      | { type: 'CLEAR_ALL_REF' }
      | { type: 'INPUT', key: KBD_INPUT }
      | { type: 'NOOP' }
    ,
    input: {} as {
      themeActor: ActorRefFrom<ThemeMachine>,
      source: Source,
      indexMap: IndexCollection,
    }
  },
  guards: {
    validPosition: ({ event, context }) => {
      assertEvent(event, 'GOTO');
      return event.position >= 0 && event.position < context.numLabels;
    },
    hasPosition: ({ context }) => context.currentPosition !== undefined,
    noPosition: ({ context }) => context.currentPosition === undefined,
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
      themeActor: input.themeActor,
      indexLookup,
      positionLookup,
      currentPosition: undefined,
      numLabels: indexLookup.size,
      showHeader: true,
    }
  },
  states: {
    normal: {
      initial: 'inactive',
      on: {
        INPUT: {
          actions: raise(({ event }) => {
            switch (event.key) {
              case KBD_INPUT.HELP:
              case KBD_INPUT.H:
                return { type: 'TOGGLE_MODAL' };
              case KBD_INPUT.SHIFT_R:
                return { type: 'INVERT_COLORS' };
              case KBD_INPUT.BACKSLASH:
                return { type: 'TOGGLE_HEADER' };
              default:
                return { type: 'NOOP' }
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
              actions: raise({ type: 'JMP', offset: +1 })
            },
            PREV_LABEL: {
              actions: raise({ type: 'JMP', offset: -1 })
            },
            JMP: {
              actions: raise(({ event, context }) => ({
                type: 'GOTO', position: context.currentPosition! + event.offset
              }))
            },
            GOTO: {
              // CONSIDERED HARMFUL
              guard: 'validPosition',
              actions: assign(({ event, context }) => {
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
          actions: raise(({ event }) => {
            switch (event.key) {
              case KBD_INPUT.ESC:
              case KBD_INPUT.H:
                return { type: 'TOGGLE_MODAL' };
              case KBD_INPUT.SHIFT_R:
                return { type: 'INVERT_COLORS' };
              default:
                return { type: 'NOOP' }
            }
          })
        },
        TOGGLE_MODAL: {
          // restore last active normal state
          target: 'normal.hist'
        }
      }
    }
  },
  on: {
    INVERT_COLORS: {
      actions: ({ context }) => {
        context.themeActor.send({ type: 'INVERT' });
      }
    },
    TOGGLE_HEADER: {
      actions: assign({
        showHeader: ({context}) => !(context.showHeader)
      })
    }
  }
})

export type PageRenderMachine = typeof pageRenderMachine;
export const ShowHeaderSelector = (snapshot: SnapshotFrom<PageRenderMachine>) => snapshot.context.showHeader;

// takes a ref of a page render machine instance, and produces an event dispatcher that takes in a keyboard input event

export function keyEventDispatcherCreator(renderRef: ActorRefFrom<PageRenderMachine>) {
  return function(event: KeyboardEvent) {
    // console.log("Key pressed: " + event.key);
    switch (event.key) {
      case 'a':
      case 'A':
        renderRef.send({ type: 'INPUT', key: KBD_INPUT.A });
        break;
      case 'h':
        renderRef.send({ type: 'INPUT', key: KBD_INPUT.H });
        break;
      case 'R':
        renderRef.send({ type: 'INPUT', key: KBD_INPUT.SHIFT_R });
        break;
      case '?':
        renderRef.send({ type: 'INPUT', key: KBD_INPUT.HELP });
        break;
      case 'Escape':
        renderRef.send({ type: 'INPUT', key: KBD_INPUT.ESC });
        break;
      case '\\':
        renderRef.send({ type: 'INPUT', key: KBD_INPUT.BACKSLASH });
      default:
        break;
    }
  }
}
