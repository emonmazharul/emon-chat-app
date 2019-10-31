// Elements

const msgForm = document.querySelector('form');
const msgInput = document.querySelector('#msgInput');
const msgBtn  = msgForm.querySelector('button');
const sendLocation = document.querySelector('#sendLocation');
const messages = document.querySelector('#messages');


// Templates

const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;
// Options
const  {username,room } = Qs.parse(location.search, {ignoreQueryPrefix: true});
const socket = io();

function autoScroll() {
    // new messages element;
    const $newMesages = messages.lastElementChild
   
    // height of last messages
    const newMessageStyles = getComputedStyle($newMesages);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight= $newMesages.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = messages.offsetHeight

    // container height
    containerHeight = messages.scrollHeight;

    // how far have i scrolled
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
           messages.scrollTop = messages.scrollHeight;
    }
   
} 



socket.on('message', (data) => {
      const html = Mustache.render(messageTemplate, {
          message: data.text,
          username: data.username,
          createdAt:  moment(data.createdAt).format('h:mm a'),
      });
      messages.insertAdjacentHTML('beforeend', html);
      autoScroll();
    
     
})
socket.on('sendLocation', (data) => {
    const html = Mustache.render(locationTemplate, {
        username: data.username,
        locationUrl: data.url,
        createdAt:  moment(data.createdAt).format('h:mm a'),

    })
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', data => {
    const chatSidebar = document.getElementById('chatSidebar');
    const html = Mustache.render(sidebarTemplate, {
        room: data.room,
        users: data.users,
    })
    chatSidebar.innerHTML = html;
})

msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(msgInput.value.length > 0) {
        msgBtn.disabled = true;
        const message = msgInput.value;
        socket.emit('chats', message, (err) => {
            msgBtn.disabled = false;
            if(err) {
                
                console.log(err);
            } else {
               
              console.log('message delivered');
            }
        });
        msgInput.value = '';
        msgInput.focus();
        window.scrollBy(0,document.body.scrollHeight);

    }
})

sendLocation.addEventListener('click', (e) => {
    e.target.disabled = true;
    if(!navigator.geolocation) {
        return alert('your browser does\'t support geolocation api')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            console.log('location shared');
            e.target.disabled = false;
        });
    })
})

socket.emit('join', {username,room} ,(err) => {
   if(err) {
       alert(err);
       location.href = '/'
   } 
});