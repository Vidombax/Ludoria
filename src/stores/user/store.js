import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        id: 0,
        isAuthenticated: false,
        name: '',
        previousStatusGame: '',
        isTokenInvalid: false,
        isMenuOpen: false
    }),
    actions: {
        setName(newName) {
            this.name = newName;
        },
        setStatusGame(newStatus) {
            this.previousStatusGame = newStatus;
        },
        setStatusMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            if (this.isMenuOpen === true) {
                document.getElementById('info').classList.add('info_mobile');
                document.body.classList.add('hidden_scroll');
            }
            else {
                document.getElementById('info').classList.remove('info_mobile');
                document.body.classList.remove('hidden_scroll');
            }
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
