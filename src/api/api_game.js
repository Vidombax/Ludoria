import axios from 'axios'

async function getNewReleaseGames(page) {
    if (page === 1) {
        return (await axios.post(`/api/game-by-release-date`)).data;
    }
    else {
        return (await axios.post(`/api/game-by-release-date?page=${page}`)).data;
    }
}
async function getGameInfo(id) {
    return (await axios.post(`/api/game-info/${id}`)).data;
}
async function getFeedbacksByGame(id) {
    return (await axios.post(`/api/feedback-by-game/${id}`)).data;
}
async function getSubscribes(id) {
    return (await axios.get(`/api/subs-by-game/${id}`)).data;
}
async function getGameByName(name) {
    const data = {
        name: name
    }
    return (await axios.post(`/api/search-game`, data)).data;
}
async function getPopularGame(page) {
    if (page === 1) {
        return (await axios.get(`/api/popularity-game`)).data;
    }
    else {
        return (await axios.get(`/api/popularity-game?page=${page}`)).data;
    }
}
async function getGamesByQueries(params) {
    return (await axios.post(`/api/games-by-query?genres=${params.genres}&scores=${params.scores}&following=${params.userList}`, {
        developers: params.developers
    })).data;
}
export default {
    getNewReleaseGames,
    getGameInfo,
    getFeedbacksByGame,
    getSubscribes,
    getGameByName,
    getPopularGame,
    getGamesByQueries
}
