import axios from 'axios'

async function getDeveloperByName(name) {
    return (await axios.get(`/api/developer/${name}`)).data;
}

export default {
    getDeveloperByName,
}
