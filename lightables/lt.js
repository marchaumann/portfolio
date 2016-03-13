var usrArray=[
	'marc haumann',
	'Jan Michellardi',
	'belleshaw',
	'efo',
	'colerise',
	'C&aacute;mara lenta!',
	'davidboysoncooper',
	'melancholija',
	'Salva L&oacute;pez',
	'Elizaveta Porodina',
	'overshadowed',
	'hello hand',
	'Lorena F. Prieto',
	'margaret durow',
	'@jessewright',
	'deux%',
	'IrenaS',
	'Harry Bloom',
	'Jared Zimmerman',
	'Shelbie Dimond',
	'Falling Thru The Lens',
	'jessica daly'
];
var imgarray=[
	'spinner.gif',
	'arrow.png',
	'hs/graphics/loader.big.black.gif'
];
var currentuser;
var currentuserid;
var currentuserurl;
var callcount=0;
var step=-1;
var counter=-1;
var hsexpand = 'return hs.expand(this)';
var preloaded = new Array(3);
function loadImgs(a){
  for( i=0; i<a.length; i++ ){
    preloaded[i] = new Image()
    preloaded[i].src = a[i]
  }
}
function center() {
	iw=$('#introtext').width();
	ih=$('#introtext').height();
	sw=$('#searchfield').width();
	sh=$('#searchfield').height();
	W=$(window).width();
	H=$(window).height();
	$('#introtext').css({'top':(H-ih)/2.5,'right':(W-iw)/2});
	if($('#searchfield').hasClass('big')){
		$('#searchfield').css({'top':(H-sh)/2.5,'right':(W-sw)/2});
	};
};
function snap() {
	wh=$(window).height();
	ww=$(window).width();
	gh=$('#grid').height();
	gw=$('#grid').width();
	t=parseInt($('#grid').css('top'));
	l=parseInt($('#grid').css('left'));
	x=ww-gw+10;
	y=wh-gh+23;
	if($('#dragload #text').html()=='release to load more'){
	    $('#controls li:first').click();
	    $('#dragload').fadeTo(300,0,function(){
	        $('#dragload #text').html('drag to load more');
	    });
	}
	else {
	    if(t>23 && l>-10){//topleft
    		$('#grid').animate({'top':23,'left':-10},300,'easeOutQuart')
    	}
    	if(t>23 && l<x){//topright
    		$('#grid').animate({'top':23,'left':x,},300,'easeOutQuart')
    	}
    	if(t<y && l<x){//bottomright
    		$('#grid').animate({'top':y,'left':x},300,'easeOutQuart')
    	}
    	if(t<y && l>-10){//bottomleft
    		$('#grid').animate({'top':y,'left':-10},300,'easeOutQuart')
    	}
        if(t>23){//top
    		$('#grid').animate({'top':23},300,'easeOutQuart')
    	}
    	if(t<y){//bottom
    		$('#grid').animate({'top':y},300,'easeOutQuart')
    	}
    	if(l>-10){//left
    		$('#grid').animate({'left':-10},300,'easeOutQuart')
    	}
    	if(l<x){//right
    		$('#grid').animate({'left':x},300,'easeOutQuart')
    	}
	    $('#dragload').fadeTo(300,0,function(){
	        $('#dragload #text').html('drag to load more');
	    });
	}
};
function cycle(){
	step++;
	if(step==usrArray.length){step=0};
	$('.usr').html(usrArray[step]);
};
function checkHash(){
	if(window.location.hash){
		hash=window.location.hash.split('#')[1];	$.getJSON("https://www.flickr.com/services/rest/?method=flickr.urls.lookupUser&api_key=eb6329489724ac78ff7fb720c46da42a&url=https%3A%2F%2Fwww.flickr.com%2Fpeople%2F"+hash+"%2F&format=json&jsoncallback=?", function(data){
			$('#userinput').val(data.user.username._content);
			$('#go').click();
		});
	}
};
$(document).ready(function(){
	/*if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
		$('meta').html('Tap an album cover to play/pause.')
		}
	else if(navigator.userAgent.match(/iPad/i)){
		$('.square').hover(function(){
			$(this).addClass('fullopacity-hover');
		},function(){
			$(this).removeClass('fullopacity-hover');
		});
	};*/
	$('#blackout').hide();
	center();
	checkHash();
	loadImgs(imgarray);
	$('#userinput').focus(function(){
		val=$(this).val();
		if(val=='enter a flickr screen name'){
			$(this).val('');
		}
	});
	$('#userinput').blur(function(){
		if($(this).val()==''){
			setTimeout("$('#userinput').val('enter a flickr screen name')",500);
		}
	});
	$('.usr').live('click',function(){
		$('#userinput').focus().val($('.usr').html());
		$('#go').click();
	});
	$('#go').click(function(){
	$.getJSON("https://www.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key=eb6329489724ac78ff7fb720c46da42a&username="+$('#userinput').val()+"&format=json&jsoncallback=?", function(data){
		    if (data.stat=='ok'){
			currentuser=$('#userinput').val();
			setTimeout("$('#go').css('background-image','url(spinner.gif)')",300);
			$('#userinput, #searchfield, #go').removeClass('big').addClass('tiny').css({'top':'','right':''});
			$('#searchfield').removeClass('bigmod');
			$('#introtext, #blackout').fadeTo(200,0,function(){
				$(this).hide();
			});
			$('#bar').fadeTo(500,1);
			$('#go, #userinput').blur();
			currentuserid=data.user.id;
			$.getJSON("https://www.flickr.com/services/rest/?method=flickr.urls.getUserProfile&api_key=eb6329489724ac78ff7fb720c46da42a&user_id="+currentuserid+"&format=json&jsoncallback=?", function(data){
				
				url=data.user.url;
				currentuserurl=url.split('/')[4];
				window.location.hash=currentuserurl;
			});
			callcount=1;
			$.getJSON('https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=eb6329489724ac78ff7fb720c46da42a&user_id='+data.user.id+'&per_page=30&page=1&format=json&jsoncallback=?', function(data){
				
				$('#title').html('<a target="_blank" href="http://www.flickr.com/people/'+data.photos.photo[0].owner+'/">'+currentuser+'&rsquo;s light table</a>');
				window.location.hash=currentuserurl;
				document.title="light tables / "+currentuser;
				$('#grid').fadeTo(300,0,function(){
					$('html').css('background','#111');
					$(this).animate({'top':23,'left':-10},0).fadeTo(300,1).width(2100);
					$('#grid *').remove();
					counter=-1;
					remaining=data.photos.photo.length;
					$.each(data.photos.photo, function(i,item){
						var photoURL='https://farm'+item.farm+'.static.flickr.com/'+item.server+'/'+item.id+'_'+item.secret;
						var photoLINK='https://www.flickr.com/photos/'+item.owner+'/'+item.id+'/';
						colmaker=i%5;
						if(colmaker==0){
							$('#grid').append('<ul class="column"></ul>');
							counter++;
						}
						$('.column').eq(counter).append("<li><a class='permalink' href='"+photoLINK+"' target='_blank'>&infin;</a><a class='theimage' href='"+photoURL+"_b.jpg'><img src='"+photoURL+".jpg' /></a></li>");
						$('#grid li:eq('+i+') img').load(function(){
							remaining--;
							$(this).fadeTo(300,1);
							if(remaining==0){
								$('#go').css('background-image','url(arrow.png)');
								$('#userinput').val('enter a flickr screen name');
							}
						});
					});
				})
			})
		}
		else if($('#userinput').val()=='enter a flickr screen name' || $('#userinput').val()==''){
			return false;
		}
		    else{
				$('#userinput').val("there was an error, sorry!");
				setTimeout("$('#userinput').val('enter a flickr screen name')",2000);
			}
		    });
	});
	$('#controls li:first').click(function(){
		callcount++;
		$('#userinput').val(currentuser);
		$('#go').css('background-image','url(spinner.gif)');	$.getJSON('https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=eb6329489724ac78ff7fb720c46da42a&user_id='+currentuserid+'&per_page=30&page='+callcount+'&format=json&jsoncallback=?', function(data){
			$('#grid').width(2100*callcount).animate({'top':23,'left':-10-(2100*(callcount-1))},700,'easeOutQuint');
			counter=(callcount-1)*6;
			remaining=data.photos.photo.length;
			$.each(data.photos.photo, function(i,item){
				var photoURL='https://farm'+item.farm+'.static.flickr.com/'+item.server+'/'+item.id+'_'+item.secret;
				var photoLINK='https://www.flickr.com/photos/'+item.owner+'/'+item.id+'/';
				colmaker=i%5;
				if(colmaker==0){
					$('#grid').append('<ul class="column"></ul>');
					counter++;
				};
				$('.column').eq(counter-1).append("<li><a class='permalink' href='"+photoLINK+"' target='_blank'>&infin;</a><a class='theimage' href='"+photoURL+"_b.jpg'><img src='"+photoURL+".jpg' /></a></li>");
				$('#grid li:eq('+(i+((callcount-1)*30))+') img').load(function(){
					remaining--;
					$(this).fadeTo(300,1);
					if(remaining==0){
						$('#go').css('background-image','url(arrow.png)');
						$('#userinput').val('enter a flickr screen name');
					}
				});
			});
		})
	});
	$('#controls li:last').click(function(){
		$('#blackout, #introtext').fadeTo(400,1);
		center();
	});
	$('#controls li:last').one('click',function(){
		$('#introtext h2').html('Inspired by the <a target="_blank" href="http://www.flickr.com/photos/31454324@N00/419128803/">real-world analog</a>, this viewer lets you explore flickr photostreams in an expansive grid. Drag to pan. Click on a photo to enlarge it, or click its permalink (&infin;) to view it directly on flickr. Use the input to load another light table, or try one of these: <a href="javascript:void(0)" class="usr">word aesthetic</a>').addClass('infomod');
		$('.foot').html('2011 Designed by <a target="_blank" href="http://marchaumann.net/">Marc Haumann</a>. Built with <a target="_blank" href="http://jquery.com/">jQuery</a>, <a target="_blank" href="http://highslide.com/">Highslide</a>, and the <a target="_blank" href="http://www.flickr.com/services/api/">Flickr API</a>. light tables is not endorsed or certified by flickr. <a target="_blank" href="https://lightables.tumblr.com/submit">submit a screenshot</a>.<br /><iframe src="http://www.facebook.com/plugins/like.php?href=http://www.facebook.com/pages/Light-Tables/205475326136451&amp;layout=button_count&amp;show_faces=false&amp;width=85&amp;action=like&amp;colorscheme=dark&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:85px; height:21px;" allowTransparency="true"></iframe>');
	});
	$('#blackout').click(function(){
		$('#introtext, #blackout').fadeTo(200,0,function(){
			$(this).hide();
		});
	});
	if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
			$('body').css('overflow','auto');
			$('#grid').css('position','absolute');
		}
	else {
		$('#grid').draggable({drag:function() {
		        wh=$(window).height();
        	    ww=$(window).width();
        	    gh=$('#grid').height();
        	    gw=$('#grid').width();
        	    t=parseInt($('#grid').css('top'));
        	    l=parseInt($('#grid').css('left'));
        	    x=ww-gw+10;
        	    y=wh-gh+23;
        	    if((l-x)<0){$('#dragload').css({'right':-(l-x)-190+'px','opacity':(-(l-x))/(ww/7)})};
        	    if((l-x)<-180){
        	        $('#dragload #text').html('release to load more');
        	        $('#dragload #arrow').html('&#x25CE;');
        	    }
        	    else{
        	        $('#dragload #text').html('drag to load more');
        	        $('#dragload #arrow').html('&#x25C0;');
        	    }
		    },stop:snap
		});
		/*
		Chris Barr's Text Selection Disabler funcion appears below
		(http://chris-barr.com/entry/disable_text_selection_with_jquery/)
		*/
		$(function(){
			$.extend($.fn.disableTextSelect = function() {
				return this.each(function(){
					if($.browser.mozilla){//Firefox
						$(this).css('MozUserSelect','none');
					}else if($.browser.msie){//IE
						$(this).bind('selectstart',function(){return false;});
					}else{//Opera, etc.
						$(this).mousedown(function(){return false;});
					}
				});
			});
			$('.noselect').disableTextSelect();//No text selection on elements with a class of 'noselect'
		});
	};
});
$('.column li').live('mouseenter',function(){
	$(this).find('.permalink').addClass('shown')
	}).live('mouseleave',function(){
	$(this).find('.permalink').removeClass('shown')
});
$('.theimage').live('click',function(){
	return hs.expand(this)
});
$('#searchfield').ready(function(){
	center();
});
$(window).ready(function(){
	$(window).resize(center);
	$('#searchfield').fadeTo(300,1);
	$('#introtext').fadeTo(900,1);
	cycle=setInterval(cycle,1500);
	$('#userinput').bind('keydown',function(e) {
    	if (e.keyCode=='13') {
			e.preventDefault();
			$('#go').focus().click();
    	}
	});
})