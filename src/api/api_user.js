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

export default {
    loginUser,
    registrationUser,
    getUserInfo,
}