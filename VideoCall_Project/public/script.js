const socket = io('/')
const videoGrid = document.getElementById('video-grid')
console.log(videoGrid)

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

let userVideoStream;
const userVideo = document.createElement('video')
userVideo.muted = false;

const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    userVideoStream = stream;
    createVideoStream(userVideo,stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          createVideoStream(video, userVideoStream)
        })
      })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
      })

    let userMsg = $('input');

    $('html').keydown(function (s) {
        if(s.which == 13 && userMsg.val().length != 0) {
          socket.emit('message',userMsg.val());
          userMsg.val('')
        }
    });

    socket.on("createMessage", message => {
      $("ul").append(`<li class="message"><b>user:</b><br/>${message}</li>`);
      chatScroll()
    })
})

const chatScroll = () => {
  var i = $('.chat_window');
  i.scrollTop(i.prop("scrollHeight"));
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
  })

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      createVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
  }

function createVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata',() => {
        video.play()
    })
    videoGrid.append(video)
}

const audioControl = () => {
  const audioOn = userVideoStream.getAudioTracks()[0].enabled;

  if(audioOn){
    userVideoStream.getAudioTracks()[0].enabled = false;
    unmuteDisplay();
  }
  else{
    muteDisplay();
    userVideoStream.getAudioTracks()[0].enabled = true;

  }
}

const unmuteDisplay = () => {
  const html = `
    <i class="fas fa-microphone-alt-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.mic_button').innerHTML = html;
}

const muteDisplay = () => {
  const html = `
    <i class="fas fa-microphone-alt"></i>
    <span>Mute</span>
  `
  document.querySelector('.mic_button').innerHTML = html;
}


const videoControl = () => {
  const audioOn = userVideoStream.getVideoTracks()[0].enabled;

  if(audioOn){
    userVideoStream.getVideoTracks()[0].enabled = false;
    pauseDisplay();
  }
  else{
    playDisplay();
    userVideoStream.getVideoTracks()[0].enabled = true;

  }
}

const pauseDisplay = () => {
  const html = `
    <i class="far fa-eye-slash"></i>
    <span>Start Video Stream</span>
  `
  document.querySelector('.video_button').innerHTML = html;
}

const playDisplay = () => {
  const html = `
    <i class="far fa-eye"></i>
    <span>Stop Video Stream</span>
  `
  document.querySelector('.video_button').innerHTML = html;
}

