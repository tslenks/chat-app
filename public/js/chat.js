// Connect the server to the client
// this method is provided by the script that loaded behind this script in the index.html
// This allows to connect to the server and the client was able to connect to the client
// when the "new web socket connection" is printed found in the index.js
/*
io.on('connection', () => {
    console.log('new web socket connection')
})
*/
const socket = io()

/** SOCKET ACTION 1 */
// count is the parameter passed into the connection event
/*socket.on('countUpdated', (count) => {
    console.log(`count ${count}`)
})

// client emit to the server
const inc = document.querySelector('#increment')
inc.addEventListener('click', () => {
    // send to the ever single connectd client 
    socket.emit('increment')
})
*/

/** SOCKET ACTION 2 */
/* socket.on('message', (message) => {
    console.log('message', message)
})

const inc = document.querySelector('#increment')
inc.addEventListener('click', () => {
    socket.emit('welcoming', 'Trent')
}) */

/** SOCKET ACTION 3 */
const $messageForm = document.querySelector('#messages-form')
const $messageFormInput = $messageForm.querySelector('#chatmsg')
const $messageFormButton = $messageForm.querySelector('button')
const $buttonSendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate  = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options to extract window.location.search or just location.search
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {

    //get the new added message element 
    const $newMessage = $messages.lastElementChild

    // get the height of this last message
    const newMessageStyles = getComputedStyle($newMessage) // to get all styles for the element
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight  + newMessageMargin// the margin is not included
    
    // get the visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    // Check if the scroll position is not in the bottom so we don't autoscroll
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // scroll to the bottom
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
  // become the template
  const html = Mustache.render(messageTemplate, {
      username: message.username,
      message:message.text,
      createdAt: moment(message.createdAt).format('h:mm a')
    })  // can be found in the index.html and the object can contains as many key-value as we wanted to render in the html
  $messages.insertAdjacentHTML('beforeend', html) // beforeend  add the text in the bottom but inside the div that represents the $messages
  autoScroll()
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username:location.username,
        location: location.url, // can be found in the index.html and the object can contains as many key-value as we wanted to render in the html
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// const chatbtn = document.querySelector('#chatbtn');
$messageForm.addEventListener('submit', (e) => {    
    e.preventDefault()

    // disabled submit button after sending
    $messageFormButton.setAttribute('disabled', 'disabled')

    // const message = document.querySelector('#chatmsg').value or 
    //const message = document.querySelector('input').value or   // if only there is one input
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {

        // re-enable the button for next message, clear the message input
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =  ''
        $messageFormInput.focus()

        if(error) {
            return console.log('error ==> ', error)
        }
        // this callback method is used to ackwnoledged that the message was delivered
        console.log('the message was delivered!')
    })
})

// Add geolocation :: google :: "MDN geolocation"
$buttonSendLocation.addEventListener('click', (e) => {
    if(!navigator.geolocation) {
        return alert('geolocation not supported by your browser')
    }
    $buttonSendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                $buttonSendLocation.removeAttribute('disabled')
                console.log('Location shared')
            })
    })
})

socket.emit('join', { username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})