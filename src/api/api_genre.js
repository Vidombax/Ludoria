import axios from 'axios'

async function getAllGenres() {
    return (await axios.get(`/api/genres`)).data;
}

export default {
    getAllGenres,
}
