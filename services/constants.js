import { ref } from 'vue'
export const genders = [
    {
        value: true,
        label: 'Мужской',
    },
    {
        value: false,
        label: 'Женский',
    },
    {
        value: null,
        label: '',
    },
]

export const months = [
    {
        value: '01',
        label: 'января'
    },
    {
        value: '02',
        label: 'февраля'
    },
    {
        value: '03',
        label: 'марта'
    },
    {
        value: '04',
        label: 'апреля'
    },
    {
        value: '05',
        label: 'мая'
    },
    {
        value: '06',
        label: 'июня'
    },
    {
        value: '07',
        label: 'июля'
    },
    {
        value: '08',
        label: 'августа'
    },
    {
        value: '09',
        label: 'сентября'
    },
    {
        value: '10',
        label: 'октября'
    },
    {
        value: '11',
        label: 'ноября'
    },
    {
        value: '12',
        label: 'декабря'
    },
]

export const statusGame = [
    {
        value: 0,
        label: 'Пройдено',
    },
    {
        value: 1,
        label: 'Играю',
    },
    {
        value: 2,
        label: 'Заброшено',
    },
    {
        value: 3,
        label: 'Запланировано'
    }
]

export const chartOptions = ref({
    indexAxis: 'y',
    elements: {
        bar: {
            borderWidth: 2,
        }
    },
    responsive: true,
    plugins: {
        legend: {
            position: 'right',
            display: false
        },
        title: {
            display: false,
            text: ''
        }
    },
    scales: {
        x: {
            ticks: {
                stepSize: 1,
                callback: function (value) {
                    if (value % 1 === 0) {
                        return value;
                    }
                },
            },
        },
    },
},);

export const paramsForFilters = ref({
    scores: [4, 3, 2, 1, 0],
    genres: [],
    developers: [],
    years: []
});

export const reports = ref([
    {
        value: 0,
        label: 'Контент для взрослых'
    },
    {
        value: 1,
        label: 'Мультиаккаунт'
    },
    {
        value: 2,
        label: 'Оскорбление'
    },
    {
        value: 3,
        label: 'Реклама'
    },
    {
        value: 4,
        label: 'Спам'
    },
    {
        value: 5,
        label: 'Другое'
    },
])
