import { setup } from "xstate";

export const labelMachine = setup({
    types: {
        events: {} as
            | { type: 'PUSH_REFERENCE'}
            | { type: 'POP_REFERENCE'}
            | { type: 'FOCUS'}
            | { type: 'UNFOCUS'}
    }
}).createMachine({
    id: 'labelMachine',
    initial: 'unfocused',
    states: {
        unfocused: {
            on: {
                FOCUS: {
                    target: 'focused'
                }
            }
        },
        focused: {
            on: {
                UNFOCUS: {
                    target: 'unfocused'
                }
            }
        }
    }
})
