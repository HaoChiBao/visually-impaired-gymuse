const getNumberFromString = (str) => {
    try {
        if (typeof str !== 'string') {
            throw new Error('Argument must be a string')
        }
        
        return str.match(/\d+/g).map(Number);

    } catch {
        return [-1]
    }
}

export default getNumberFromString;