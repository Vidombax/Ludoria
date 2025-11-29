import axios from 'axios'

async function getNewestPosts() {
    return (await axios.get(`/api/new-post`)).data;
}
async function createPost(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`,
        }
    };

    const formData = new FormData();

    formData.append('file', data.file);

    formData.append('header', data.header);
    formData.append('description', data.description);
    formData.append('id_game', data.id_game);
    formData.append('id_user', data.id_user);
    formData.append('is_article', data.is_article);

    return (await axios.post(`/api/post`, formData, config)).data;
}
async function getPost(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`,
        }
    };

    return (await axios.post(`/api/post/${data.id}`, data, config)).data;
}
async function getUserPosts(id) {
    return (await axios.get(`/api/user-posts/${id}`)).data;
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
async function deletePost(data) {
    const config = {
        headers: {
            Authorization: `${data.token}`
        }
    };

    return (await axios.delete(`/api/delete-post/${data.id}`, null, config)).data;
}

export default {
    getNewestPosts,
    getPost,
    createPost,
    updatePost,
    ratePost,
    deletePost,
    getUserPosts
}