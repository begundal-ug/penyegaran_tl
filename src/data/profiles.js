const raw = require('./raw');
const rawNew = require('./raw-new');
const short = require('short-uuid');

function pickRandom(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result.map( res => ({...res, id: (res.id).toString(), unique_key: short.generate() }));
}

const getRandom = async (n = 8) => {
    const randData = pickRandom(raw, n);
    const randUserData = randData.map(dt => {
        return {
            id: dt.id,
            img: dt.media[0],
            likes: dt.total_count,
            link: dt.original_link,
            date: dt.date_created,
            unique_key: dt.unique_key,
        }
    });

    return randUserData;
}

const getRandomNew = async (n = 8) => {
    const randUserData = pickRandom(rawNew, n);

    return randUserData;
}

const getProfileById = async(id) => {
    const profile = rawNew.find((item) => item.id === (+id) )
    return !!profile 
        ? {...profile, unique_key: short.generate() } 
        : { error: `cannot find profile ${id}` }
}

module.exports = {
    getRandom,
    getRandomNew,
    getProfileById
}