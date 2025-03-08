import axios from 'axios'

async function loginUser(email, password) {
    return (await axios.post(`/api/login`, {
        email: email,
        password: password
    })).data;
}
async function registrationUser(data) {
    return (await axios.post(`/api/register`, {
        name: data.name,
        email: data.email,
        password: data.password
    })).data;
}
async function getUserInfo(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/user/${data.id}`, null, config)).data;
}
async function updateUser(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/update`, data, config)).data;
}
async function updateUserPhoto(data) {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('id', data.id);

    return (await axios.post(`/api/update-photo`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })).data;
}
async function getGameRateByUser(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.get(`/api/get-rate/${data.id_user}/${data.id_game}`, config)).data;
}
async function rateGame(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/rate-game`, data, config)).data;
}
async function subToGame(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/subscribe`, data, config)).data;
}

export default {
    loginUser,
    registrationUser,
    getUserInfo,
    updateUser,
    updateUserPhoto,
    getGameRateByUser,
    rateGame,
    subToGame
}
