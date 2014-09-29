$(document).ready(function(){
	var oldnum;
	var num;
	var track;
	var wWidth;
	var wHeight;
	var trend = [
	  [97,'9:00am',''],
	  [108,'10:05am',''],
	  [147,'11:30am',''],
	  [52,'12:04pm',''],
	  [219,'3:14pm','after lunch'],
	  [67,'4:10pm',''],
	  [98,'4:23pm',''],
	  [179,'5:02pm',''],
	  [118,'5:43pm',''],
	  [162,'6:40pm',''],
	  [36,'7:34pm','running'],
	  [136,'7:56pm',''],
	  [110,'8:12pm',''],
	  [156,'9:05pm',''],
	  [330,'11:20pm','ice cream'],
	  [63,'1:30am',''],
	  [102,'1:45am',''],
	  ['5u','7:03pm','56g carb, rice, beans, salad'],
	  ['8u','11:15pm','74g carb, ice cream']
	];
	$('ul.tabcontent li').hide();
	function dotOver() {
	  $(this).animate({width:'20px',height:'20px',left:'-=5px',top:'-=5px'},100);
	};
	function dotOut() {
	  $(this).animate({width:'10px',height:'10px',left:'+=5px',top:'+=5px'},100);
	};
	function dot() {
		if (track) {$(track).animate({
				width:'10px',
				height:'10px',
				left:'+=5px',
				top:'+=5px'
			},100).bind('mouseenter',dotOver).bind('mouseleave',dotOut)
		};
		$(this).unbind('mouseenter mouseleave');
		oldnum = $('#tags').attr('value');
		num = $(this).attr('name');
		$('#big-bg').html(trend[num][0]);
		$('#date').html(trend[num][1]);
		$('#tags').attr('value',trend[num][2]);
		if ($('#tags').attr('value').length==0){
			$('#tags').attr('value','add tags');
		 };
		track = $(this);
	};
	function fitBrowser() {
		wWidth=$(window).width();
		wHeight=$(window).height();
		if (wWidth<1024) {
			$('ul.medium').width(680);
			$('.container').height(945);
			$('#card').width(680).height(945);
			$('.full').width(660).height(925);
			$('.sidebar ul').height(925);
			$('.full .content').width(370);
			$('#flipback').css('margin-top',540);
		}
		else {
			$('ul.medium').width(344);
			$('.container').height(630);
			$('#card').width(1024).height(630);
			$('.full').width(1004).height(610);
			$('.sidebar ul').height(610);
			$('.full .content').width(620);
			$('#flipback').css('margin-top',230);
		};
		vMargin = ((wHeight-45)/2)-(($('.container').height())/2);
		$('.container').css('padding-top',vMargin);
	};
	$('#settingsToggle, #flipback').click(function(){
		if($('#card').hasClass('flipped')) {
			$('#card').removeClass('flipped');
			$('#settingsToggle').removeClass('selected');
			setTimeout("$('#graphslider').show()",200);
			
		}
		else {
			$('#card').addClass('flipped');
			$('#settingsToggle').addClass('selected');
			setTimeout("$('#graphslider').hide()",150);
		}
	});
  	$('.dot, .rect').click(function(){
		if ($(this).width()==20){return;}
		else {
			if (track && $(track).hasClass('dot')) {$(track).animate({width:'10px',height:'10px',left:'+=5px',top:'+=5px'},200)};
			if(!$(this).hasClass('rect')){$(this).animate({width:'20px',height:'20px',left:'-=5px',top:'-=5px'},200)};
			oldnum = $('#tags').attr('value');
			num = $(this).attr('name');
			$('#big-bg').html(trend[num][0]);
			$('#date').html(trend[num][1]);
			$('#tags').attr('value',trend[num][2]);
			if ($('#tags').attr('value').length==0){
				$('#tags').attr('value','add tags');
			 };
			track = $(this);
		}
	});
	$('#tags').focus(function() {
		if ($(this).val() == 'add tags') {
			$(this).val('');
		}
	});
	$("#tags").keyup(function(e) {
		if(e.keyCode==13){
			trend[num][2] = $(this).val();
			$(this).blur();
		}
	});
	/*$('button, a, .tabs li, .sidebar li').each(function(){
		$(this).bind('touchstart',function(){$(this).addClass('touching')});
		$(this).bind('touchend',function(){$(this).removeClass('touching')});
	});
	$('*[id!=graphslider]').bind('touchmove',function(e){
		if(navigator.userAgent.match(/iPad/i)) {e.preventDefault()}
	});*/
	$('ul.tabs li, .sidebar li').click(function(){
		currentIndex = $(this).prevAll().length;
		$(this).parent('ul').children().removeClass('selected touching');
		$(this).addClass('selected');
		$(this).parents('.bubble').find('ul.tabcontent li').hide();
		$(this).parents('.bubble').find('ul.tabcontent li').eq(currentIndex).show();
		if($('#scroller').hasClass('selected')){$('#graphslider').scrollLeft(1200)};
	});
	$('.biglist .bbutton').click(function(){
		if ($(this).attr('id')=='add-device') {
			return
		}
		else if ($(this).attr('id')=='addcheck') {
			$(this).parents('.biglist').append('<p class="due"><input type="checkbox" /><input type="textarea" value="" class="newp" /><span class="delete">-</span></p>');
		}
		else {
			$(this).parents('.biglist').append('<p><input type="textarea" value="" class="newp" /><span class="delete">-</span></p>');
		};
		$(this).parents('.biglist').find('input:last').focus();
	});
	$('#quickpeek ul.smallcontent li').click(function(){
		$('#chart .tabs li').eq($(this).attr('name')).click();
	});
	$('.biglist input[type=checkbox]').live('click',function(){
		if($(this).attr('checked')) {
			$(this).parent().removeClass('due');
		}
		else {
			$(this).parent().addClass('due');
		}
	});
	$('.delete').live('click',function(){
		$(this).parent().remove();
	});
	$('.full .sidebar li').eq(0).click();
	$('#chart .tabs li').eq(0).click();
	$('[name*="16"]').mouseenter().click();
	fitBrowser();
	$(window).load(fitBrowser);
	$(window).resize(fitBrowser);
	window.addEventListener('orientationchange', fitBrowser, false);
	setTimeout(fitBrowser,100);
	if((navigator.userAgent.match(/Chrome/)) || (navigator.userAgent.match(/Firefox/)) || (navigator.userAgent.match(/MSIE/))) {
		$('#back').hide();
	};
	if(navigator.userAgent.match(/iPad/i)) {
		$('#header').css('position','fixed')
	};
	if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
		$('#header').css({
			'position':'fixed',
			'width':680
		});
		$('meta[name=viewport]').attr("content",'width=content-width, minimum-scale=0.1, maximum-scale=1, user-scalable=yes');
	};
});