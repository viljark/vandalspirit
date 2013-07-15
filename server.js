var fs = require('fs'),
	path=require('path'),
	ds=require('ds'),
	contenttype={
		'html': { 'Content-Type':'text/html'},
		'js':   { 'Content-Type':'text/javascript'},
		'css':  { 'Content-Type':'text/css'},
		'png':  { 'Content-Type':'image/png'},
		'ico':  { 'Content-Type':'image/gif'},
		'gif':  { 'Content-Type':'image/gif'}
		
	},	
	extname= function (url){
		var p=url.split('/'),
			lp=p[p.length-1];
		p=lp.split('.');
		lp=p[p.length-1];	
		return lp;
	},
	handler=function(req,res){		
		if (req.url=='/') req.url='/index.html'
		var ext=extname(req.url),
			sessionid
		if(req.headers.cookie){
			var cp=req.headers.cookie.split(';'),
				co;
			for(var nr in cp){				
				co=cp[nr]
				co=co.split('=')
				if(co[0].replace(/ /g,'')=='sessionid'){
					sessionid=co[1]
					break;
				}
			}
			
		}
		if (contenttype[ext]){
			fs.readFile(path.resolve(__dirname+req.url), function (err, data) {
				var ctype = contenttype[ext];
				if (err) {
					res.writeHead(404,{ 'Content-Type':'text/html'});
					res.end('Error loading: '+req.url,'utf-8');				
				} else {
					res.writeHead(200,ctype);
					res.end(data,'utf-8');
				}
			});	
		} 
		else {	
			var data=unescape(req.url.substr(1)),
				user
			try {					
				data=JSON.parse(data)
			} catch (err){
				res.writeHead(400)
				console.log('bad JSON format:',req.url)
				res.end('bad JSON format: '+req.url)
				return 0
			}				
			switch(data.type){
				case 'ds':
					//is authented
					var com=data.com,
						isauth=0;
					
					user=users.users[sessionid]
					if(user) user.time=new Date().getTime()
					
					//console.log('ds com:',com,isauth,sessionid,sessionid.length);
											
					//is owner
					var isowner=function(){
					
					}
					var allow=0
					if (com=='get'){
						allow=1
					} else if (user){
						switch (com){
							case 'add':
								allow=1
								break;
							case 'rem':
								var cdata={}
								for(var key in data){
									cdata[key]=data[key]
								}
								cdata.com='get'
								ds.handler(cdata,function(rdata){								
									console.log('rem data:',rdata)																		
								})							
								res.writeHead(200);
								res.end('almost removed');									
								break;
						}
					}
					
					if (allow) {						
						ds.handler(data,function(rdata){
							if(typeof(rdata)=='object') rdata=JSON.stringify(rdata)
							res.writeHead(200);
							res.end(rdata);
						})
					} else {
						res.writeHead(200);
						res.end('not allowed login');							
					}
					break
				case 'auth':
					//fake auth
					if (data.com=='login'){						
						if (data.name && data.mail && data.id){
							var user=users.adduser(data)								
							res.writeHead(200);
							res.end(user.sessionid)
							
						} else {
							res.writeHead(200);
							res.end('bad auth:'+req.url);												
						}											
					} else {
						var sessionid=req.headers.cookie.split('=')[1]
						users.remuser(sessionid)
						res.end('out you go')
					}										
					break
				default:
					res.writeHead(200);
					res.end('handler not defined:'+p[1]);							
					break
			}
		}
	},
	app = require('http').createServer(handler),
	users={
		users:{},
		adduser: function(data){
			var user={
				sessionid: new Date().getTime()+data.id,
				time: new Date().getTime(),
				authented: {
					name: data.name,
					mail: data.mail,
					id: data.id
				}
			}
			users.users[user.sessionid]=user
			console.log('add user:',user.sessionid)
			return user
		},
		remuser: function(sessionid){
			if(sessionid in users.users) {
				delete users.users[sessionid]
				console.log('rem user:',sessionid)
			}			
		},
		isauthented: function(sessionid){
			if(sessionid in users.users)
				return users.users[sessionid].authented.id
			return false;
		}
	}
	
//rem users after 60 mins
var kicktime=3600000
function remusers(){
	var time=new Date().getTime(),
		user
	for(var sessionid in users.users){
		user=users.users[sessionid]
		if (time-user.time>kicktime){
			remuser(sessionid)
		}		
	}
	setTimeout(function(){
		remusers()
	},kicktime)
}
remusers()

fs.exists(path.resolve(__dirname+'/ds'),function(exists){
	if(!exists) fs.mkdir(path.resolve(__dirname+'/ds'));
})

app.listen(2222);
console.log('SERVER STARTED');

// lets handle uncaught exceptions 
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log("Caught an unexpected exception:", err);
});
