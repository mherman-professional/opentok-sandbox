// replace these values with those generated in your TokBox Account
var apiKey = "46104652";
var sessionId = "2_MX40NjEwNDY1Mn5-MTUyNDU5NzMzNzExNX5qZkJrTUpNS08zNmZDaGVHb0Fza0NrZ1J-fg";
var token = "T1==cGFydG5lcl9pZD00NjEwNDY1MiZzaWc9NmViZThmODVlMzkzOTIzN2JhOTQzNmQxMTc0MjlhYjcyOTcyMzYyYzpzZXNzaW9uX2lkPTJfTVg0ME5qRXdORFkxTW41LU1UVXlORFU1TnpNek56RXhOWDVxWmtKclRVcE5TMDh6Tm1aRGFHVkhiMEZ6YTBOcloxSi1mZyZjcmVhdGVfdGltZT0xNTI0NTk3MzU4Jm5vbmNlPTAuMTM1MTY0MDE1Mzc3NDExMTgmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTUyNDYwMDk1NyZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ==";

// (optional) add server code here
initializeSession();

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function initializeSession() {
  var session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function(event) {
    session.subscribe(event.stream, 'subscriber', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    }, handleError);
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
}