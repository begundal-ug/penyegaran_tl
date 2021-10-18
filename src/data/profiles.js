const raw = require('./raw');
const short = require('short-uuid');

const getRandom = async (n = 8) => {
    const userData = raw.map(dt => {
        return {
            id: short.generate(),
            img: dt.media[0],
            likes: dt.total_count,
            link: dt.original_link,
            date: dt.date_created,
        }
    });
    const randUserData = userData.sort(() => Math.random() - Math.random()).slice(0, n);

    return randUserData;
}

module.exports = {
    getRandom,
}