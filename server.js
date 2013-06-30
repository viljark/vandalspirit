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
		var p=req.url.split('/'),
			inner=0,
			mes='handled inner:'+p[1],			
			ext,
			ctype;
		
		if(inner==0){
			if (req.url=='/') req.url='/index.html'
			
			ext=extname(req.url);				
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
				var pack=unescape(req.url.substr(1));
				try {					
					pack=JSON.parse(pack)
				} catch (err){
					res.writeHead(400)
					console.log('bad JSON format:',req.url)
					res.end('bad JSON format: '+req.url)
					return 0
				}				
				switch(pack.type){
					case 'ds':
						//is authented
						var sessionid='',
							itemid='',
							ownerid
							
						var isauthented=function(){
						
						}
												
						//is owner
						var isowner=function(){
						
						}
						
						ds.handler(req,res,pack)					
						break
					case 'auth':
						if (pack.com=='login'){
							if (pack.name && pack.mail && pack.id){
								var user=users.adduser(pack)								
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
						console.log('users:',users.users)
						break
					default:
						res.writeHead(200);
						res.end('handler not defined:'+p[1]);							
						break
				}
			}
		} 
		else {
			res.writeHead(200);
			res.end(mes);
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
			return user
		},
		remuser: function(sessionid){
			if(sessionid in users.users) delete users.users[sessionid]
		},
		isauthented: function(sessionid){
			if(sessionid in users.users)
				return users.users[sessionid].authented.id
			return false;
		}
	}
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
