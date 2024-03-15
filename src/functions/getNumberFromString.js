const getNumberFromString = (str) => {
    return str.match(/\d+/g).map(Number);
}

export default getNumberFromString;