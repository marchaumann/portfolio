var toggle='off';
var song;
var currentsong;
var thisindex;
var nextindex;
var previndex;
var scrubtracker;
var dragging='off';
var wWidth;
var wHeight;
var mix = [
	['Futile Devices','"Futile Devices" by Sufjan Stevens','The Age of Adz','http://itunes.apple.com/us/album/the-age-of-adz/id392327958'],
	['Bloom','"Bloom" by Radiohead','The King of Limbs','http://www.thekingoflimbs.com/'],
	['Twice','"Twice" by Little Dragon','Little Dragon','http://itunes.apple.com/us/album/little-dragon/id384661630'],
	['Blood','"Blood" by The Middle East','The Recordings of the Middle East','http://itunes.apple.com/us/album/the-recordings-middle-east/id332945707'],
	['White Sky','"White Sky" by Vampire Weekend','Contra','http://itunes.apple.com/us/album/contra-bonus-track-version/id340465551'],
	['Thousand Ways','"Thousand Ways" by The Tallest Man on Earth','The Wild Hunt','http://itunes.apple.com/us/album/the-wild-hunt-bonus-track/id365022480'],
	['Anthems for a Seventeen Year-Old Girl','"Anthems for a Seventeen Year-Old Girl" by Broken Social Scene','You Forgot It in People','http://itunes.apple.com/us/album/you-forgot-it-in-people/id6925826'],
	['Walkabout (with Noah Lennox)','"Walkabout (with Noah Lennox)" by Atlas Sound','Logos','http://itunes.apple.com/us/album/logos/id327300080'],
	['The King','"The King" by Ramesh','The King','http://rcrdlbl.com/2011/01/17/premiere_ramesh_the_king'],
	['Untrust Us','"Untrust Us" by Crystal Castles','Crystal Castles','http://itunes.apple.com/us/album/crystal-castles-bonus-track/id275732228'],
	['Young Blood','"Young Blood" by The Naked and Famous','Passive Me, Aggressive You','http://itunes.apple.com/us/album/young-blood-single/id402814711'],
	['Helplessness Blues','"Helplessness Blues" by Fleet Foxes','Helplessness Blues','http://itunes.apple.com/us/album/helplessness-blues-single/id419657098']	
]

function removeLoader() {
	$('#'+thisindex+'').find('.load').removeClass('fullopacity');
	$('#scrubber, #time').addClass('playing');
};

function nextSquare() {
	$('#'+nextindex+'').click();
};

function prevSquare() {
	$('#'+previndex+'').click();
}
function playPause() {
	$(song).unbind('ended',nextSquare);
	$('#'+thisindex+'').find('.load').removeClass('fullopacity');
	thisindex = $(this).attr('id');
	nextindex = parseInt(thisindex)+1;
	previndex = parseInt(thisindex)-1;
	$('.load').removeClass('fullopacity');
	if (nextindex == mix.length) {nextindex = 0};
	if (previndex == -1) {previndex = mix.length-1};
	if (currentsong !== thisindex) {
		$('#ppicon').css('visibility','hidden');
		$('#'+currentsong+', .pause').removeClass('fullopacity');
		song.pause();
		$('#scrubber, #time').removeClass('playing');
		$('#'+thisindex+'').find('.load').addClass('fullopacity');
		$(song).html('<source src="'+mix[thisindex][0]+'.mp3" /><source src="'+mix[thisindex][0]+'.ogg" />');
		song.load();
	}
	if (song.paused) {
		song.play();
		$('#ppicon').css('visibility','visible').find('img').css('top','');
		//$('#stage').css('zoom','200%');
		document.title = mix[thisindex][1] + " / THEGRIDMIX";
		$('#title').html(mix[thisindex][1]);
		$('#description').html('from the album <a target="_blank"  href="'+mix[thisindex][3]+'">'+mix[thisindex][2]+'</a>');
		if(toggle=='on'){$('#info').css('height',$('#description').height()+$('#foot').height()+10)};
		$(song).bind('ended',nextSquare);
		$(this).addClass('fullopacity');
		currentsong = thisindex;
		$('#'+thisindex+'').find('.pause').removeClass('fullopacity');
	}
	else {
		song.pause();
		$('#ppicon').css('visibility','visible').find('img').css('top','-18px');
		//$('#stage').css('zoom','100%');
		document.title = "PAUSED / " + mix[thisindex][1] + " / THEGRIDMIX";
		$(song).unbind('ended',nextSquare);
		$('#'+thisindex+'').find('.pause').addClass('fullopacity');
	};
};
function scrub(){
	percent = song.currentTime/song.duration;
	if(dragging=='off'){
		$('#time').css('width',percent*wWidth);
	}
	else {
		song.currentTime=(scrubtracker/wWidth)*(song.duration);
	}
	console.log(song.duration);
};

$(document).ready(function(){
	function fitBrowser() {
		wWidth = $(window).width();
		wHeight = $(window).height();
		if ((wWidth<=960 && wHeight>768) || (wWidth<960 && wHeight<960)) {
			$('#stage').width(672);
		}
		else {
			$('#stage').width(896);
		};
		vMargin = (wHeight/2)-(($('#stage').height()+35)/2);
		$('#stage').css('padding-top',vMargin);
	};
	if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {$('#foot p:first').html('Tap an album cover to play/pause.')}
	else{
		$('.square').hover(function(){
			$(this).addClass('fullopacity-hover');
		},function(){
			$(this).removeClass('fullopacity-hover');
		});
		//$(window).resize(fitBrowser);
	};
	song = $('audio')[0];
	/*$('#header').hover(function(){
		$('#title, #info-icon').css('color','#e5e5e5');
		$('#info-icon').css('background','#555');
	},function(){
		$('#title, #info-icon').css('color','');
		$('#info-icon').css('background','');
	});
	$('#header').click(function() {
		if (toggle=='off'){
			$('#info').css({'height':$('#description').height()+$('#foot').height()+10,'z-index':'80'});
			if($('#scrubber').height()>0){
				$('#caption').css('padding-top','40px');
			};
			toggle='on';
		}
		else {
			$('#info').css({'height':'0','z-index':'-1'});
			$('#caption').css('padding-top','');
			toggle='off';
		}
	});*/
	$('#caption').hover(function() {
		h=$('#description').height()+$('#foot').height()+10;
		$('#info').css({'height':h,'z-index':'80'});
		if($('#scrubber').height()>0){
			$('#scrubber').css('top',h+35+'px');
		};
	},function(){
		$('#info').css({'height':'0','z-index':'-1'});
		$('#scrubber').css('top','0');
	});
   
	$('.square').bind('click',playPause);
	/*$('#scrubber').hover(function(){
		$(this).css('background-color','#555');
		$('#time').css('background-color','#aaa');
	},function(){
		$(this).css('background-color','#2c2c2c');
		$('#time').css('background-color','#404040');
	});*/
	$('#scrubber').mousemove(function(e){
		scrubtracker = e.pageX;
		if (scrubtracker<0) {scrubtracker=0;dragging='off'};
		if (scrubtracker>wWidth) {scrubtracker=wWidth;dragging='off'};
		if(dragging=='on'){
			$('#time').css('width',scrubtracker);
		}
	});
	$('#scrubber').mousedown(function(e){
		e.preventDefault();
		dragging='on';
		$('#time').css('width',scrubtracker);
	});
	$('#scrubber').mouseup(function(){dragging='off'});
	$('#titlewrap').click(function(){
		if($('#description').height()==0) {$('#0').click()}
		else{$('#'+thisindex+'').click()}
	})
	setInterval(scrub,100);
	fitBrowser();
	$(window).load(fitBrowser);
	$(window).ready(fitBrowser);
	$(window).resize(fitBrowser);
	window.addEventListener('orientationchange', fitBrowser, false);
	setTimeout(fitBrowser,100);
	$(song).bind('canplay',removeLoader);
	$(window).bind('keydown', function(e) {
		if (e.keyCode == '32') {
			e.preventDefault();
			if($('#description').height()==0) {$('#0').click()}
			else{$('#'+thisindex+'').click()};
    	}
    	if (e.keyCode == '37') {
			e.preventDefault();
    		prevSquare();
    	}
   		if (e.keyCode == '39') {
			e.preventDefault();
   			nextSquare();
   		}
	});
});