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
	var teokoda=function(){
		var teokoda=ds.add('teokoda')			
		teokoda.add('hoiud')
		teokoda.add('aiad')
		teokoda.add('hoidjad')
		teokoda.add('trennid')
		teokoda.add('ringid')
			
		teokoda.get(function(res){
			var but,
				groups=[];
			loop(JSON.parse(res),function(ind,ele){		
				but=nav.add('button',{
					html: ele.toUpperCase()
				})
				dnet.post(teokoda.add(ele))
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
		
		return teokoda
	}()
	function getgroup(name){
		dnet.post('ds.teokoda.'+name+'.get()',function(res){
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
		addfield('omanik').to(m.form)
		addfield('nimi').to(m.form)
		addfield('aadress').to(m.form)
		addfield('tel').to(m.form)
		addfield('lisa info','textarea').to(m.form)		
		
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
			pos
		data.id=selected.innerHTML.toLowerCase()+new Date().getTime()
		pos=activemarker.getPosition()
		data.pos=[pos.jb,pos.kb]
		data=JSON.stringify(data)
		dnet.post('ds.teokoda.'+selected.innerHTML.toLowerCase()+'.add('+data+')',function(res){
			modal.wrap.hide()
			mapd.show()				
			getgroup(selected.innerHTML.toLowerCase())
		})						
		if (activemarker) {
			activemarker.setMap(null)
			activemarker=0
		}		
	})
	modal.del.on('click',function(){
		selectedmarker.setMap(null)
		var group=selected.innerHTML.toLowerCase(),
			itemid=selectedmarker.itemid
		dnet.post('ds.teokoda.'+selected.innerHTML.toLowerCase()+'.rem('+itemid+')',function(res){
			modal.wrap.hide()
			mapd.show()				
			getgroup(selected.innerHTML.toLowerCase())
		})
	})		
		

	function addfield(name,tag){
		tag=tag || 'input'
		var field=document.createElement('div')
		field.className='field'				
		field.add('label',{
			'for': name,
			html: name,
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
		var auth={}
		auth.wrap=d.body.add('div',{
			id: 'auth'
		})
		auth.gg=auth.wrap.add('button',{
			id:'google',
			html: 'google'
		})
		auth.gg.on('click',function(e){
			// auth.loadAuth();
			handleAuthClick();
			makeApiCall();
			var data={
				type: 'auth',
				data: {
					name: 'name1g',
					mail: 'mail1g',
					id: 'id1g'
				}
			}
			dnet.post(JSON.stringify(data),function(res){
				var data=JSON.parse(res)
				document.cookie="sessionid="+data.sessionid
				console.log('cookie:',document.cookie);
			})
		})
		auth.fb=auth.wrap.add('button',{
			id:'facebook',
			html: 'facebook'
		})
		auth.fb.on('click',function(e){
			// auth.loadAuth();
			FB.login(function () {
				
			});
			var data={
				type: 'auth',
				data: {
					name: 'name1f',
					mail: 'mail1f',
					id: 'id1f'
				}
			}
		})
		auth.loadAuth = function () {
			d.head.add("script",{
				src: "https://apis.google.com/js/client.js?onload=handleClientLoad",
			})
			d.head.add("script", {
				src: "auth.js"
			})
		}
		return auth
	}()
})