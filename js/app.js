// declare session variable outside of initializeSession so it can be accessed for signaling
var session;
var connectionList = [];
var connectionCount = 0;

// create a session object
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
  // remove recipient selector option when client closes the connection
  session.on('connectionDestroyed', function(event) {
    var dropConnection = session.connection;
    document.getElementById(dropConnection.id).remove();
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

  // when a new connection is created add a new option to the recipient selection list
  session.on("connectionCreated", function(event) {
   var newConnection = session.connection;
   ++connectionCount;
   connectionList[newConnection.id] = newConnection;
   document.getElementById('recipient').innerHTML += '<option id="' + newConnection.id + '" value="' + newConnection.id + '">Recipient ' + connectionCount + '</option>';
 });
 session.on("sessionConnected", function(event) {
  console.log(session);
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

// When the filter selector changes we update the selectedFilter
var recipientId = 'all';
var recipientSel = document.querySelector('#recipient');
recipientSel.addEventListener('change', function change() {
    recipientId = recipientSel.value;
});

form.addEventListener('submit', function submit(event) {
  event.preventDefault();

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
  }
});
