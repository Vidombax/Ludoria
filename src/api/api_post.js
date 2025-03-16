import axios from 'axios'

async function getNewestPosts() {
    return (await axios.get(`/api/new-post`)).data;
}
async function createPost(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/post`, data, config)).data;
}
async function updatePost(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/update-post`, data, config)).data;
}
async function ratePost(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.post(`/api/rate-post`, data, config)).data;
}

export default {
    getNewestPosts,
    createPost,
    updatePost,
    ratePost
}