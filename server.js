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
			ext;
		
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
				
				var data;
				try {
					data=JSON.parse(req.url.split('/')[1])
				} catch (err){
					
				}
				console.log('data:',data);
				if (data){
					if(data.type=='ds'){
						
					} else if (data.type=='auth'){
						if (data.name && data.mail && data.id){
							var user=users.adduser(data)
							res.end(JSON.stringify(user))
						}
					} else {
						/*
						res.writeHead(200);
						res.end('handler not defined:'+p[1]);						
						/**/
					}
				}
				/**/
				//console.log('url:',req.url.split('/')[1])
				
				//ds				
				if(p[1].substr(0,2)=='ds'){
					//check auth
					ds.handler(req,res)
				} else if (req.url=='authent') {
					
				} else {
					res.writeHead(200);
					res.end('handler not defined:'+p[1]);
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
			users.users[session]=user
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
