import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
    state: () => ({
        chartGameData : {
            labels: ['Пройдено', 'Играю', 'Заброшено', 'Запланировано'],
            datasets: [
                {
                    label: '',
                    data: [],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FFCE22'],
                    hoverOffset: 4,
                },
            ],
        }
    })
});
