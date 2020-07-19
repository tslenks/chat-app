const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user
    const  existingUser = users.find(user =>  username === user.username && user.room === room)

    // Validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if(index !== -1) {
        // this is fast than using the filter as filter will continue till the end
        return users.splice(index, 1)[0] // return the removed array
    }

}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (roomName) => {
    return users.filter(user => user.room === roomName.toLowerCase().trim())
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}
