import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        id: 0,
        name: '',
        previousStatusGame: '',
        isTokenInvalid: false
    }),
    actions: {
        setName(newName) {
            this.name = newName;
        },
        setStatusGame(newStatus) {
            this.previousStatusGame = newStatus;
        }
    },
    getters: {
        getName: (state) => {
            return state.name;
        },
        getPreviousStatusGame: (state) => {
            return state.previousStatusGame;
        },
    },
});
