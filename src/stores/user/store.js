import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        name: '',
        previousStatusGame: '',
        chartGameData : {
            labels: ['Пройдено', 'Играю', 'Заброшено', 'Запланировано'],
            datasets: [
                {
                    label: 'Пример данных',
                    data: [],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    hoverOffset: 4,
                },
            ],
        }
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
