(function(){
	//string to arguments for render and styles
	function stoa(obj,s,sep){	
		var tonext,
			tothis		
		s=s.split(sep)
		loop(s,function(ind,ele){
			ele=ele.split(' ')
			if(ind==0){
				if(sep=='=') {
					obj=d.new(ele[0])
					if(ele.length>1) {
						ele.shift()
						tonext=ele[0]
					}
				} else {
					tonext=ele[0]
				}			
			} else {					
				tothis=tonext
				if(ind!=s.length-1){
					if(ele.length>1) {
						tonext=ele.pop()
					}				
				}
				if(sep=='=') {
					obj.set(tothis,ele.join(' '))				
				} else {
					obj.style[tothis]=ele.join(' ')
				}
			}
		})
		return obj	
	}
	//node
	Node.prototype.find=function(sel){
		return this.findall(sel)[0];
	}
	Node.prototype.findall=function(sel){	
		function findit(sel,tars){	
			var tars1=[];
			for (var nr in tars){
				var tar=[],
					ctar=tars[nr];
				switch (sel[0]){
					case '.':
						tar=ctar.getElementsByClassName(sel[1]);
						break;
					case '#':
						tar.push(document.getElementById(sel[1]) || '');
						break;
					default:
						tar=ctar.getElementsByTagName(sel[1]);
						break;
				}
				//return tar;
				if ('toarray' in tar){
					tar=tar.toarray()
				}					
				tars1=tars1.concat(tar);			
				//remove duplicates
				var nodup=[];
				for(var nr in tars1){
					if(nodup.indexOf(tars1[nr])==-1) nodup.push(tars1[nr]);
				}		
			}
			return nodup;
		}

		var sel=sel.split(' '),
			arr=[],
			csel='',
			found=[this];
					
		for(var nr=0;nr<sel.length;nr++){
			csel=sel[nr];
			if (csel[0]=='.' || csel[0]=='#') {
				csel=[csel[0],csel.substr(1,csel.length-1)]
			} else {
				csel=['',csel]
			}
			found=findit(csel,found);
		}		
		return  found;
	}
	Node.prototype.trigger=function(n,a){
		var e = document.createEvent("HTMLEvents");
		e.initEvent(n, true, true ); // event type,bubbling,cancelable		
		if (a) e.args=a;
		this.dispatchEvent(e);	
		return this;
	}
	Node.prototype.on=function(name,fn,f){
		this.addEventListener(name,fn, f || false);
		if (!this.eventfunctions) this.eventfunctions={};
		this.eventfunctions['efn-'+name]=fn;
		return this;
	}
	Node.prototype.off=function(n,fn,f){
		var fn=this.eventfunctions['efn-'+n];
		this.removeEventListener(n,fn, f || false);
		return this;
	}
	//document
	document.extend=function(o1,o2){
		for(var k in o2) o1[k]=o2[k];
	};
	document.on('DOMContentLoaded',function(){
		document.trigger('ready');
	})	
	document.new=function(tag,attrs){
		var ele=document.createElement(tag)
		if (attrs) ele.set(attrs)
		return ele
	}
	document.r=function(s){
		return stoa(0,s,'=')
	}
	//element
	//Element.prototype.display='initial'
	Element.prototype.findup=function(sel){
		if (!sel) {
			return this.parentNode;
		} else {			
			var type=sel[0],
				p=this.p
			switch(type){
				case '#':
					if(p.id==sel) {
						return p
					} else {
						p.findup(sel)
					}
					break
				case '.':
					if(p.hasclass(sel.substr(1))){
						return p
					} else {
						p.findup(sel)
					}				
					break
				default:
					if(p.tagName.toLowerCase()==sel) {
						return p
					} else {
						p.findup(sel)
					}				
					break
				
			}
			return false
		}		
	}
	Element.prototype.next=function(changescope){
		var found=false;
		if (changescope){
			found=this.children[0] || this.nextSibling;
			if (found==null){
				var obj=this;
				//stop if document
				while (found==null){
					obj=obj.parentElement;
					if (obj==document.body){
						found=document.body;
					} else {
						found=obj.nextSibling;
					}
				}
			}		
		} else {
			found=this.nextSibling;
		}
		return found;
	}
	Element.prototype.prev=function(changescope){
		var found=false;	
		if (changescope){
			found=this.children[this.children.length-1] || this.previousSibling;
			if (found==null){
				var obj=this;
				//stop if body
				while (found==null){
					obj=obj.parentN;
					if (obj==document.body){
						found=document.body;
					} else {
						found=obj.previousSibling;
					}
				}
			}
			
		} else {
			found=this.previousSibling;
		}
		return found;
	}
	Element.prototype.to=function(parent,l){
		var p=parent.parentElement;
		switch(l){		
			case 'first':
				if (parent.children.length){
					parent.insertBefore(this,parent.children[0])				
				} else {
					parent.appendChild(this);
				}
				break;
			case 'before':
				p.insertBefore(this,parent);
				break;
			case 'after':
				p.insertBefore(this,parent.nextSibling);
				break;			
			default:
				parent.appendChild(this);
		}
		return this;
	}
	Element.prototype.new=function(tag,attrs,loc){
		var ele=document.createElement(tag);
		if (attrs) {
			if(typeof(attrs)=='string') {
				ele.innerHTML=attrs
			} else {
				ele.set(attrs)			
			}
		}
		ele.to(this,loc);
		return ele;		
	}
	Element.prototype.rem=function(){
		this.parentNode.removeChild(this);
		return this
	}
	Element.prototype.set = function (a,v) {
		if (typeof(a)=='object'){
			var v;
			for (var k in a) {
				v = a[k];
				this.set(k,v);
			}
		} else {	
			switch (a) {
				case 'html':
					this.innerHTML = v;
					break;
				case 'style':
					for (var n in v) {
						this.style[n] = v[n];
					}
					break;
				default:
					this.setAttribute(a, v);
					break;
			};
		}
	};
	Element.prototype.get = function (n,n2){
		switch(n){
			case 'html':
				n=this.innerHTML;
				break;
			case 'style':
				if (n2) {
					n=this.style[n2];
				} else {
					n=this.style;
				}
				break;
			default:
				n=this.getAttribute(n)
				break;
		}	
		return n;
	};
	Element.prototype.show = function () {	
		this.style.display = this.display || window.getComputedStyle(this).display;
		delete this.display;
		var e = document.createEvent("HTMLEvents");
		e.initEvent('show', true, true ); // event type,bubbling,cancelable
		this.dispatchEvent(e);		
	};
	Element.prototype.hide = function () {
		if(this.style.display!='none'){
			this.display=window.getComputedStyle(this).display;
			this.style.display = 'none';
			var e = document.createEvent("HTMLEvents");
			e.initEvent('hide', true, true ); // event type,bubbling,cancelable
			this.dispatchEvent(e);		
		}
	};
	Element.prototype.addclass=function(n){
		var cl=this.className.split(' '),
			nl=n.split(' ');
		if (cl[0]=='') cl.shift()
		for(var nr in nl){
			n=nl[nr]
			if (cl.indexOf(n)==-1){
				cl.push(n)
			}
		}	
		this.className=cl.join(' ');
		return this;
	}
	Element.prototype.remclass=function(n){
		if (n){
			var nl=this.className.split(' ');
			if (n.indexOf(' ')!=-1){
				var vl=n.split(' '),
					i;
				for (var nr in vl){
					i=nl.indexOf(vl[nr]);
					nl.splice(i,1);						
				}
			} else {
				var i=nl.indexOf(n);
				nl.splice(i,1);
			}
			this.className=nl.join(' ');			
		} else {
			this.className='';
		}
		return this;	
	}
	Element.prototype.hasclass=function(n){
		var nl=this.className.split(' '),
			ns=n.split(' '),
			o=1;
		for(var nr in ns){
			n=ns[nr]
			if (nl.indexOf(n)==-1){
				o=0
			}
		}
		return o;
	}
	Element.prototype.r=function(str){
		return stoa(this,str,'=').to(this)
	}
	Element.prototype.s=function(s){
		return stoa(this,s,':')
	}
	Element.prototype.__defineGetter__("p", function(){
		return this.parentNode;
	});
	Element.prototype.__defineSetter__("p", function(val){
		this.to(val)
	});
	Element.prototype.h=function(val){
		if (val) {
			this.innerHTML=val
			return this
		} else {
			return this.innerHTML
		}
	}	
	Element.prototype.loop=function(nr,callback){
		for(var n=0;n<nr;n++){
			callback(n,this)
		}
		return this
	}
	//Nodelist
	NodeList.prototype.toarray=function(){
		var arr = [];
		for (var i = 0, ref = arr.length = this.length; i < ref; i++) {
			arr[i] = this[i];
		}
		return arr;
	}

	console.log('loaded dom0');
})()