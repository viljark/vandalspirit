var d=document,
	modal
	
d.on('ready', function(){
	console.log('Document ready');
	/*
	dnet.post('load/sapp')
	dnet.post('sethandler/sapp.handler')
	/**/
	
	var logo=function(){
		var logo=d.body.add('div',{
			'class':'logowrap'
		})
		logo.add('div',{
			id: 'logo',
			'class':'logo',
			//html: ('Tëökoda').toUpperCase()
			html: ('Teokoda').toUpperCase()
		})
		logo.add('div',{
			'class':'img'
		})	
		return logo
	}()
	var nav=function(){
		var nav=d.body.add('div',{
			'class':'nav'
		});	
		return nav
	}()
	var selected;
	var data={
		type: 'ds',
		com: 'get',
		path: 'ds/teokoda'
	}
	//get groups
	dnet.post(data,function(res){		
		var but,
			groups=[],
			rbow=[
				'#AA3D12',
				'rgb(170, 121, 18)',
				'rgb(134, 170, 18)',
				'rgb(18, 170, 127)',
				'rgb(18, 61, 170)',
				'rgb(85, 18, 170)'				
			];
		loop(JSON.parse(res),function(ind,ele){		
			but=nav.add('button',{
				html: ele.toUpperCase(),
				style:{
					background: rbow[ind%6]
				}
			})
			but.on('click',function(){
				if (selected) selected.remclass('selected')
				this.addclass('selected')
				selected=this
				if (activemarker) {
					activemarker.setMap(null)
					activemarker=0
				}		
				getgroup(selected.innerHTML.toLowerCase())				
			})
		})
	});
	
	function getgroup(name){
		var post={
			type: 'ds',
			path: ['ds/teokoda',name].join('/'),
			com: 'get'
		}
		dnet.post(JSON.stringify(post),function(res){
		//dnet.post('ds.teokoda.'+name+'.get()',function(res){
			if (res){				
				for(var nr in markers) markers[nr].setMap(null)
				markers.length=0
				var data=JSON.parse(res),
					item,
					pos
				for(var nr in data){
					item=JSON.parse(data[nr])
					pos=new google.maps.LatLng(item.pos[0],item.pos[1]);
					var marker = new google.maps.Marker({
						position: pos,
						map: map,
						icon: '/images/'+icomap[selected.innerHTML.toLowerCase()]+'.png',
						shadow: '/images/shadow.png',
						animation: google.maps.Animation.DROP,
						title: item.nimi,
						itemid: item.id
					})	
					
					google.maps.event.addListener(marker, 'click', function(e) {
						selectedmarker=this						
						mapd.hide()
						modal.wrap.show()	
						modal.del.show()
						//modal.save.hide()	
						modal.form.find('#nimi').value=selectedmarker.itemid
					})
					markers.push(marker)
				}
			}
		})
	
	}
		
	var activemarker=0,
		selectedmarker=0,
		markers=[],
		mapd,
		mapwrap,
		icomap={
			hoidjad: 'hoidja',
			hoiud: 'hoid',
			aiad: 'aed',
			trennid: 'trenn',
			ringid: 'ring',
		};
	(function(){		
		mapwrap=d.body.add('div',{
			'class': 'mapwrap'
		})
		mapd=mapwrap.add('div',{
			id: 'map',
			'class':'map'
		})

		function initialize() {
			var mapOptions = {
				center: new google.maps.LatLng(58.37840540413009, 386.7269734802246),
				zoom: 13,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: true
			};
			map = new google.maps.Map(document.getElementById("map"),mapOptions);		
			google.maps.event.addListener(map, 'click', function(e) {
				if (selected && !activemarker){
					addnewmarker(e)
				}
			})
			google.maps.event.addListener(map, 'dragstart', function() {
				if (activemarker) {
					activemarker.setMap(null)
					activemarker=0
				}					
			})
			function addnewmarker(e){
				var marker = new google.maps.Marker({
					position: e.latLng,
					map: map,
					icon: '/images/'+icomap[selected.innerHTML.toLowerCase()]+'-.png',
					shadow: '/images/shadow.png',
					draggable:true,
					animation: google.maps.Animation.DROP,					
					title: 'Lisa uus'
				})		
				google.maps.event.addListener(marker, 'click', function(e) {					
					modal.form.find('#nimi').value=''
					mapd.hide()
					modal.wrap.show()
					modal.del.hide()
					console.log('save show');
					//modal.save.show()
				})
				activemarker=marker				
			}
			d.body.find('.nav').childNodes[0].trigger('click')
		}
		google.maps.event.addDomListener(window, 'load', initialize);		
	})();	
	
	
	modal=function(){
		var m={}
		m.wrap=mapwrap.add('div',{
			'class': 'modalwrap'
		})
		m.body=m.wrap.add('div',{
			'class':'modal'
		})
		m.header=m.body.add('div',{
			'class':'header',
			html: 'modal header'
		})
		m.content=m.body.add('div',{
			'class':'content'
		})
		
		m.form=m.content.add('form')
		addfield('owner','omanik').to(m.form)
		addfield('name','nimi').to(m.form)
		addfield('sddress','aadress').to(m.form)
		addfield('phone','tel').to(m.form)
		addfield('info','lisa info','textarea').to(m.form)		
		
		m.controls=m.body.add('div',{
			'class': 'controls'
		})
		m.cancel=m.controls.add('button',{
			'class':'cancel grey',
			html: ('Tagasi').toUpperCase()
		})
		m.save=m.controls.add('button',{
			'class':'save',
			html: ('Salvesta').toUpperCase()
		})		
		m.del=m.controls.add('button',{
			'class':'delete',
			html: ('Kustuta').toUpperCase()
		})		
		m.wrap.hide()
		return m
	}()
	modal.cancel.on('click',function(){
		if (activemarker) {
			activemarker.setMap(null)
			activemarker=0
		}
		modal.wrap.hide()
		mapd.show()
	})
	modal.save.on('click',function(){
		var data=formdata(modal.form),
			pos,
			gname=selected.innerHTML.toLowerCase()
			
		data.id=selected.innerHTML.toLowerCase()+new Date().getTime()
		data.owner=auth.fakeinput.value
		pos=activemarker.getPosition()
		data.pos=[pos.jb,pos.kb]
		var pack={
			type: 'ds',
			com: 'add',
			path: 'ds/teokoda'+'/'+gname,
			args: data
		}		
		console.log('pack:',pack)
		dnet.post(pack,function(res){
			modal.wrap.hide()
			mapd.show()				
			getgroup(selected.innerHTML.toLowerCase())
			smes.show(res)
		})						
		if (activemarker) {
			activemarker.setMap(null)
			activemarker=0
		}		
	})
	modal.del.on('click',function(){
		selectedmarker.setMap(null)
		var group=selected.innerHTML.toLowerCase(),
			itemid=selectedmarker.itemid,
			pack={
				type: 'ds',
				com:'rem',
				path: 'ds/teokoda'+'/'+selected.innerHTML.toLowerCase(),
				args: itemid
			}
		dnet.post(pack,function(res){
			modal.wrap.hide()
			mapd.show()				
			getgroup(selected.innerHTML.toLowerCase())
			smes.show(res)
		})
	})		
		
	function addfield(name,vis,tag){
		tag=tag || 'input'
		var field=document.createElement('div')
		field.className='field'				
		field.add('label',{
			'for': name,
			html: vis,
			style:{
				display: 'block'
			}
		})
		field.add(tag,{
			id: name,
			name: name,
			style:{
				display: 'block',
				width: '100%'
			}
			
		})		
		return field
	}	
	function formdata(form){
		var fields=form.findall('.field'),
			field,
			label,
			inp=[],
			data={}
		for(var nr in fields){
			field=fields[nr]
			inp=field.find('input') || field.find('textarea')				
			data[inp.get('name')]=inp.value				
		}
		return data
	}
	
	//auth
	var auth=function(){
		var a={}
		a.wrap=d.body.add('div',{
			'class': 'auth'
		})
		a.gg=a.wrap.add('button',{
			'class':'google',
			html: 'google'
		})
		a.gg.on('click',function(e){
			// auth.loadAuth();
			handleAuthClick();
			makeApiCall();
		})
		
		a.fb=a.wrap.add('button',{
			'class':'facebook',
			html: 'facebook'
		})
		a.fb.on('click',function(e){
			// auth.loadAuth();
			FB.login(function () {
				console.log('fb login');
			});
		})
		a.logged=0
		a.fake=a.wrap.add('button',{
			html: 'fake',
			'class':'fake not'
		})
		a.fakeinput=a.wrap.add('input',{
			'class':'fakeinput',
			value: 'user1'
		})
		a.fake.on('click',function(e){
			var pack={
				type: 'auth',
				com: 'login',
				name: 'user1',
				mail: 'mail1',
				id: '123'
			}
			if(auth.logged) {
				pack.com='logout'
				auth.logged=0
				dnet.post(pack,function(res){
					auth.fake.addclass('not')
				})				
			} else {
				pack.com='login'
				auth.logged=1
				dnet.post(pack,function(res){
					auth.fake.remclass('not')
					document.cookie='sessionid='+res
					console.log('cookie:',document.cookie)
				})				
			}
			
		})
	
		return a
	}()

	//server mes
	var smes=function(){
		var smes={
			show: function(mes){
				smes.cont.set({
					html: mes
				})
				smes.body.show()
			}
		}
		smes.body=d.body.add('div',{
			'class': 'smes'
		})
		smes.body.on('click',function(e){
			this.hide()
		})		
		smes.note=smes.body.add('div',{
			'class':'note',
			html: 'click to close'
		})		
		smes.cont=smes.body.add('div',{
			'class':'cont'
		})		
		return smes
	}()
})