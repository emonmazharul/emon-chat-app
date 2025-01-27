function generateMessage(username,text) {
    return {
        username,
        text,
        createdAt: new Date().getTime(),
    }
}

function generateLocationMessage(username,url) {
    return {
        url,
        username,
        createdAt: new Date().getTime(),
    }
}

module.exports={
    generateMessage,
    generateLocationMessage,
}