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
			mes='handled inner:'+p[1];
		
		if(inner==0){
			if (req.url=='/') req.url='/index.html';			
			ext=extname(req.url);				
			if (contenttype[ext]){
				fs.readFile(path.resolve(__dirname+req.url), function (err, data) {
					if (err) {
						res.writeHead(404,{ 'Content-Type':'text/html'});
						res.end('Error loading: '+req.url,'utf-8');				
					} else {
						
						var cpath=req.url.split('/'),
							plen=cpath.length,
							ctype=cpath[plen-1].split();						
						res.writeHead(200,contenttype[ext]);
						res.end(data,'utf-8');
					}
				});	
			} 
			else {				
				//ds				
				if(p[1].substr(0,2)=='ds'){
					ds.handler(req,res)
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
	app = require('http').createServer(handler)
	
fs.mkdir(path.resolve(__dirname+'/ds'),  function (err) {
	console.log("DataStore already exists!", err);
});								
app.listen(2222);
console.log('SERVER STARTED');

// lets handle uncaught exceptions 
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log("Caught an unexpected exception:", err);
});