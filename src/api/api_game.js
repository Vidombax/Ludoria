import axios from 'axios'

async function getNewReleaseGames(page) {
    if (page === 1) {
        return (await axios.post(`/api/game-by-release-date`)).data;
    }
    else {
        return (await axios.post(`/api/game-by-release-date?page=${page}`)).data;
    }
}

export default {
    getNewReleaseGames
}