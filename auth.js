var clientId = '837576772202';
var apiKey = 'AIzaSyA648IArldBDi-glneKfyBIpEiitTZwO-c';
var scopes = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
}

function checkAuth() {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
    makeApiCall();
}

function handleAuthClick(event) {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
}

function makeApiCall() {
    gapi.client.load('oauth2', 'v2', function() {
      gapi.client.oauth2.userinfo.get().execute(function(resp) {
    })
  }
)}
        
    

window.fbAsyncInit = function() {
FB.init({
  appId      : '147015492154626', // App ID
  channelUrl : 'http://teokoda.eu01.aws.af.cm//channel.html', // Channel File
  status     : true, // check login status
  cookie     : true, // enable cookies to allow the server to access the session
  xfbml      : true  // parse XFBML
});
FB.Event.subscribe('auth.authResponseChange', function(response) {
  if (response.status === 'connected') {
    testAPI();
  } else if (response.status === 'not_authorized') {
    FB.login();
  } else {
    FB.login();
  }
});
};

// Load the SDK asynchronously
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));

function testAPI() {
  FB.api('/me', function(response) {
    console.log(response);
  });
}
