import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
    state: () => ({
        chartGameData : {
            labels: ['Пройдено', 'Играю', 'Заброшено', 'Запланировано'],
            datasets: [
                {
                    label: '',
                    data: [],
                    backgroundColor: ['#46e81b', '#cc302b', '#3769c7', '#FFCE22'],
                    hoverOffset: 4,
                },
            ],
        },
        pageNumber: 1,
    }),
    actions: {
        setPageNumber(newNumber) {
            this.pageNumber = newNumber;
        },
    },
    getters: {
        getPageNumber: (state) => {
            return state.pageNumber;
        },
    },
});
