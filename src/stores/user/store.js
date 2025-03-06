import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        name: ''
    }),
    actions: {
        setName(newName) {
            this.name = newName;
        },
    },
    getters: {
        getName: (state) => {
            return state.name;
        },
    },
});
