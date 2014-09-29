<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xml:lang="en" lang="en">
<head>
<title>THEGRIDMIX</title>
<link rel="apple-touch-icon" href="/gridmix/apple-touch-icon.png"/>
<meta name="viewport" content="width=device-width, minimum-scale=0.1, maximum-scale=1, user-scalable=yes" />
<meta name="format-detection" content="telephone=no" />     
<meta name="apple-mobile-web-app-capable" content="no" />
<link rel="icon" href="/favicon.ico" type="image/x-icon"/>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js"></script>
<style type="text/css">
	html {
		background:#111;
		cursor:default;
		-webkit-tap-highlight-color:rgba(0,0,0,0);
	}
	a, a:link, a:visited, img {
		border:none;
		outline:none;
	}
	a:link, a:visited, #title {color:#aaa;text-decoration:none;}
	a:hover {background:transparent;color:#eee;cursor:pointer;}
	img {width:100%;height:100%;}
	audio {height:0;}
	#stage {
		position:absolute;
		left:0;
		right:0;
		top:0;
		margin:0 auto;
		padding:8px;
		margin-top:27px;
	}
	#caption {
		z-index:53;
		position:fixed;
		min-width:672px;
		top:0;
		left:0;
		right:0;
		padding:0 15px;
		font-size:18px;
		font-family:courier;
		line-height:1.7em;
		color:#777;
		background:#333;
		text-align:center;
		cursor:pointer;
		overflow:hidden;
	}
	#description {
		font-style:italic;
	}
	#foot p {font-size:13px;font-weight:400;line-height:2em;margin:0;}
	#info-icon {
		padding:0 6px;
		-webkit-border-radius:25px;
		-moz-border-radius:25px;
		-o-border-radius:25px;
		border-radius:25px;
		background:#444;
		color:#ccc;
		font-size:0.8em;
		font-family:georgia;
		font-style:italic;
	}
	.square, .load, .pause, #info {
		-webkit-transition: all 0.15s ease-in-out;
		-moz-transition: all 0.15s ease-in-out;
		-o-transition: all 0.15s ease-in-out;
		transition: all 0.15s ease-in-out;
	}
	.square {
		padding:7px;
		float:left;
		height:210px;
		width:210px;
		overflow:hidden;
		opacity:0.4;
		filter: alpha(opacity=40);
	}
	.square:hover {
		cursor:pointer;
	}
	.pause {
		position:relative;
		top:-420px;
		opacity:0;
		filter: alpha(opacity=0);
	}
	.load {
		position:relative;
		top:-210px;
		opacity:0;
		filter: alpha(opacity=0);
	}
	.fullopacity {
		opacity:1;
		filter: alpha(opacity=100);
	}
	.fullopacity-hover {
		opacity:1;
		filter: alpha(opacity=100);
	}
</style>
<script type="text/javascript">
var toggle='off';
var song;
var currentsong;
var thisindex;
var nextindex;
var previndex;
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
		$('#'+currentsong+', .pause').removeClass('fullopacity');
		song.pause();
		$('#'+thisindex+'').find('.load').addClass('fullopacity');
		$(song).html('<source src="'+mix[thisindex][0]+'.mp3" /><source src="'+mix[thisindex][0]+'.ogg" />');
		song.load();
	}
	if (song.paused) {
		song.play();
		document.title = mix[thisindex][1] + " / THEGRIDMIX";
		$('#title').html((mix[thisindex][1]).toUpperCase());
		$('#description').html('from the album <a href="'+mix[thisindex][3]+'">'+mix[thisindex][2]+'</a>');
		if(toggle=='on'){$('#info').css('height',$('#description').height()+$('#foot').height()+10)};
		$(song).bind('ended',nextSquare);
		$(this).addClass('fullopacity');
		currentsong = thisindex;
		$('#'+thisindex+'').find('.pause').removeClass('fullopacity');
	}
	else {
		song.pause();
		document.title = "PAUSED / " + mix[thisindex][1] + " / THEGRIDMIX";
		$(song).unbind('ended',nextSquare);
		$('#'+thisindex+'').find('.pause').addClass('fullopacity');
	};
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
		vMargin = (wHeight/2)-(($('#stage').height()+24)/2);
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
	$('#caption').hover(function(){
		$('#title, #info-icon').css('color','#e5e5e5');
		$('#info-icon').css('background','#555');
	},function(){
		$('#title, #info-icon').css('color','');
		$('#info-icon').css('background','');
	});
	
	$('#caption').click(function() {
		if (toggle=='off'){
			$('#info').css('height',$('#description').height()+$('#foot').height()+10);
			toggle='on';
		}
		else {
			$('#info').css('height','0');
			toggle='off';
		}
	});
   
	$('.square').bind('click',playPause);
	fitBrowser();
	$(window).load(fitBrowser);
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
		if (e.keyCode == '191') {
			e.preventDefault();
			$('#caption').click();
    	}
	});
});
</script>	
</head>
<body>
	
	<div id="stage">
		<audio></audio>
		<div id="3" class="square">
			<img src="recordingsofthemiddleeast.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="1" class="square">
			<img src="kingoflimbs.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="11" class="square">
			<img src="helplessnessblues.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="4" class="square">
			<img src="contra.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="8" class="square">
			<img src="theking.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="9" class="square">
			<img src="crystalcastles.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="0" class="square">
			<img src="ageofadz.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="2" class="square">
			<img src="littledragon.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="6" class="square">
			<img src="youforgotitinpeople.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="7" class="square">
			<img src="logos.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="10" class="square">
			<img src="passivemeaggressiveyou.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
		<div id="5" class="square">
			<img src="wildhunt.jpg"/><img class="load" src="load.png" /><img class="pause" src="pause.png" />
		</div>
	</div>
	<div id="caption">
		<span id="title">T H E G R I D M I X</span> <span id="info-icon">i</span>
		<div id="info" style="height:0">
			<div id="description"></div>
			<div id="uploader"></div>
			<div id="foot"><p>Click an album cover to play/pause, or use space &amp; left/right arrows.</p><p>Designed and coded by <a href="http://marchaumann.net/">Marc Haumann</a>.</p>
			</div>
		</div>
	</div>
</body>
</html>
