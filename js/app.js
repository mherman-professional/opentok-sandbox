// Declare session variable outside of initializeSession so it can be accessed for signaling
var session;
var connectionList = [];
var connectionCount = 0;

// Create a session object
function initializeSession() {
  session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function(event) {
    session.subscribe(event.stream, 'subscriber', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    }, handleError);
  });

  session.on('sessionDisconnected', handleError);
  // Remove recipient selector option when client closes the connection
  session.on('connectionDestroyed', function(event) {
    var dropConnection = event.connection.id;
    document.getElementById(dropConnection).remove();
  });

  // Create a publisher
  var publisher = OT.initPublisher('publisher', {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  }, handleError);

  // Connect to the session
  session.connect(token, function(error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });

  // When a new connection is created add a new option to the recipient selection list
  session.on("connectionCreated", function(event) {
    ++connectionCount;
    var newConnection = event.connection;
    var selectOption = document.createElement('option');
    connectionList[newConnection.id] = newConnection;
    selectOption.setAttribute('id', newConnection.id);
    selectOption.setAttribute('value', newConnection.id);
    selectOption.innerHTML = 'Recipient ' + connectionCount;
    document.getElementById('recipient').appendChild(selectOption);
 });

  // Add a new message to the thread
  var txtThread = document.getElementById('thread');
  session.on('signal:msg', function signalCallback(event) {
    var msg = document.createElement('p');
    msg.textContent = event.data;
    msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
    txtThread.appendChild(msg);
    msg.scrollIntoView();
  });
}

var form = document.getElementById('chatForm');
var msgTxt = document.getElementById('msgTxt');

// When the recipient selector changes we update the recipientId
var recipientId = 'all';
var recipientSel = document.querySelector('#recipient');
recipientSel.addEventListener('change', function change() {
    recipientId = recipientSel.value;
});

form.addEventListener('submit', function submit(event) {
  event.preventDefault();

  // If "send to all" is selected send the signal to all clients, otherwise send it only to the selected recipient and the original sender
  if(recipientId == 'all') {
    session.signal({
      type: 'msg',
      data: msgTxt.value
    }, function signalCallback(error) {
      if (error) {
        console.error('Error sending signal:', error.name, error.message);
      } else {
        msgTxt.value = '';
      }
    });
  }
  else {
    var toRecipient = connectionList[recipientId];
    var signalSender = session.connection;
    session.signal({
      type: 'msg',
      to: toRecipient,
      data: msgTxt.value
    }, function signalCallback(error) {
      if (error) {
        console.error('Error sending signal:', error.name, error.message);
      } else {
        msgTxt.value = '';
      }
    });
    if (signalSender.id != recipientId) {
      session.signal({
        type: 'msg',
        to: signalSender,
        data: msgTxt.value
      }, function signalCallback(error) {
        if (error) {
          console.error('Error sending signal:', error.name, error.message);
        } else {
          msgTxt.value = '';
        }
      });
    }
  }
});
