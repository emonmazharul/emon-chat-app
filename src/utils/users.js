const users = [];

// addUser
function addUser({id,username,room}) {
    // clean the data;
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate data
    if(!username || !room ) {
        return {
            error: 'Username and room are required',
        }
    }

    // check for existing user
    const existinguser = users.find( user => {
        return user.room === room && user.username === username
    }) 

    // validate user name
    if(existinguser) {
        return {
            error: 'Username is in use!'
        }
    }

    // store user
    const user = {id,username,room}
    users.push(user);
    return {user}
}

function removeUser(id) {
     const index = users.findIndex(user => user.id === id )
     if(index !== -1) {
         return users.splice(index,1)[0];
     }
}

function getUser(id) {
    const user = users.find(user => user.id === id);
    if(user){
        return user;
    }
}

function getUserInRoom(room) {
    const userInRoom = users.filter(user => user.room === room);
    if(userInRoom){
        return userInRoom;
    }
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom,
}