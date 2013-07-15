var clientId = '837576772202';
var apiKey = 'AIzaSyA648IArldBDi-glneKfyBIpEiitTZwO-c';
var scopes = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'; 

window.fbAsyncInit = function() {
  console.log("im called")
FB.init({
  appId      : '147015492154626', // App ID
  channelUrl : 'http://teokoda.eu01.aws.af.cm//channel.html', // Channel File
  status     : true, // check login status
  cookie     : true, // enable cookies to allow the server to access the session
  xfbml      : true  // parse XFBML
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

