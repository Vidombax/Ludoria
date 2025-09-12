import apiUser from './api_user.js'
import apiGame from './api_game.js'
import apiPost from './api_post.js'
import apiGenre from './api_genre.js'
import apiDeveloper from './api_developer.js'

export default {
    ...apiUser,
    ...apiGame,
    ...apiPost,
    ...apiGenre,
    ...apiDeveloper
}
