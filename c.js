var d=document,
	modal
	
d.on('ready', function(){
	console.log('Document ready');
	/*
	dnet.post('load/sapp')
	dnet.post('sethandler/sapp.handler')
	/**/
	
	var logo=d.body.r('div class=logowrap')
		.r('div id=logo class=logo html=Teokoda').p
		.r('div class=img').p
	
	var nav=d.body.r('div class=nav')
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
			but=nav.r('button')
				.h(ele)
				.s('background:'+rbow[ind%6])
				.on('click',function(e){
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
						modal.wrap.find('#nimi').value=selectedmarker.itemid
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
		mapwrap=d.body.r('div class=mapwrap')
			mapd=mapwrap.r('div id=map class=map')

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
					modal.wrap.find('#nimi').value=''
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
	
	
	var fields=[
			['owner','omanik'],
			['name','nimi'],
			['address','aadress'],
			['phone','tel'],
			['info','lisa info']
		],
		id,
		name
	modal={}
	modal.wrap=mapwrap.r('div class=modalwrap')
		.r('div class=modal')
			.r('div class=header html=modal header').p
			.r('div class=content')
				.r('form class=itemedit')
				.loop(fields.length,function(i,ele){
					id=fields[i][0]
					name=fields[i][1]
					ele.r('div class=field')
						.r('label for='+id)
							.h(name).p
						.r('input id='+id+' name='+name)
				}).p
				.r('div class=controls')
					.r('button class=grey cancel html=tagasi')
						.on('click',function(e){
							canceledit()
						}).p
					.r('button class=save html=salvesta')
						.on('click',function(e){
							saveitem()
						}).p
					.r('button class=delete html=kustuta')
						.on('click',function(e){
							deleteitem()
						}).p.p.p.p
	modal.del=modal.wrap.find('.delete')	
	modal.wrap.hide()
	
	function canceledit(){
		if (activemarker) {
			activemarker.setMap(null)
			activemarker=0
		}
		modal.wrap.hide()
		mapd.show()				
	}
	function saveitem(){
		console.log('saveitem')
		var data=formdata(modal.wrap.find('form')),
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
		dnet.post(pack,function(res){
			modal.wrap.hide()
			mapd.show()				
			getgroup(selected.innerHTML.toLowerCase())
			showsmes(res)
		})						
		if (activemarker) {
			activemarker.setMap(null)
			activemarker=0
		}			
	}
	function deleteitem(){
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
			showsmes(res)
		})		
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
		a.wrap=d.body.r('div class=auth')		
			a.gg=a.wrap.r('button class=google html=google')
				.on('click',function(e){
					// auth.loadAuth();
					handleAuthClick();
					makeApiCall();
				})
		
			a.fb=a.wrap.r('button class=facebook html=facebook')
				.on('click',function(e){
					// auth.loadAuth();
					FB.login(function () {
						console.log('fb login');
					});
				})
		a.logged=0
		a.fake=a.wrap.r('button class=fake not html=fake')
			.on('click',function(e){
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
		
		a.fakeinput=a.wrap.r('input class=fakeinput value=user1')
		return a
	}()

	//server mes
	function showsmes(mes){
		smes.find('.cont').h(mes)
		smes.show()
	}
	var smes=d.body.r('div class=smes')
		.on('click',function(e){
			this.hide()
		})
		.r('div class=note html=click to close').p
		.r('div class=cont').p
	smes.hide()
})