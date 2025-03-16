import apiUser from './api_user.js'
import apiGame from './api_game.js'
import apiPost from './api_post.js'

export default {
    ...apiUser,
    ...apiGame,
    ...apiPost
}