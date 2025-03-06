import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        photo: ''
    }),
    actions: {
        setPhoto(newPhoto) {
            this.photo = newPhoto;
        },
    },
    getters: {
        getPhoto: (state) => {
            return state.photo;
        },
    },
});
