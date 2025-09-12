import axios from 'axios'

async function getDeveloperByName(name, signal) {
    const response = await axios.get(`/api/developer/${encodeURIComponent(name)}`, {
        signal
    });
    return response.data;
}

export default {
    getDeveloperByName,
}
