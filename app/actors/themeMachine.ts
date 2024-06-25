import { createActorContext } from "@xstate/react";
import { raise, setup } from "xstate";

export type Theme = "light" | "dark" | "system";

export const themeMachine = setup(
  {
    types: {
      input: {} as { theme: Theme },
      events: {} as
        | { type: 'LIGHT' }
        | { type: 'DARK' }
        | { type: 'SYSTEM' }
        | { type: 'INVERT' }
        | { type: 'SET', theme: Theme }
    }
  }
).createMachine({
  initial: 'system',
  states: {
    light: {
      on: {
        DARK: {
          target: 'dark',
        },
        SYSTEM: {
          target: 'system',
        },
        INVERT: {
          target: 'dark',
        }
      }
    },
    dark: {
      on: {
        LIGHT: {
          target: 'light',
        },
        SYSTEM: {
          target: 'system',
        },
        INVERT: {
          target: 'light',
        }
      }
    },
    system: {
      on: {
        LIGHT: {
          target: 'light',
        },
        DARK: {
          target: 'dark',
        },
        INVERT: {
          target: 'light',
        }

      }

    },
  },
  on: {
    SET: {
      actions: raise(({ event }) => {
        switch (event.theme) {
          case "light": return { type: 'LIGHT' };
          case "dark": return { type: 'DARK' };
          case "system": return { type: 'SYSTEM' };
        }
      })

    }
  }
})

export type ThemeMachine = typeof themeMachine;
export const ThemeContext = createActorContext(themeMachine);
