var initialX = 0;

function slides(id,pos) {
    $('#'+id+' .slidecaption:not(.single)').removeClass('shown');
    $('#'+id).find('.slidecaption').eq(pos).addClass('shown');
    $('#'+id).find('.slides li').removeClass('shown');
    $('#'+id).find('.slides li').eq(pos).addClass('shown');
    $('#'+id+' .slides ul').css('-webkit-transform','translateX('+(-(pos*$('.slides li').width()))+'px)');
    $('#'+id+' .dots span').eq(pos).addClass('active').siblings().removeClass('active');
};

function scrollToHash() {
	hashpos=$(window.location.hash).offset();
	$(window).scrollTop(hashpos.top);
};

function onOrientationChange(){
    switch(window.orientation){  
      case -90:
      case 90:
          if(navigator.userAgent.match(/iPhone/i)) { 
              $('meta[name=viewport]').attr('content','width=1000px, initial-scale=0.55, minimum-scale=0.55, maximum-scale=1, user-scalable=no');
          }
        break; 
      default:
          if(navigator.userAgent.match(/iPhone/i)) { 
              $('meta[name=viewport]').attr('content','initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no');
        }
        break; 
    }
};
// thanks to @ryuutatsuo on stackoverflow for the touch handler function! http://stackoverflow.com/questions/5186441/javascript-drag-and-drop-for-touch-devices

function touchHandler(event) {
    var touch = event.changedTouches[0];
    console.log(touch);
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    // console.log(simulatedEvent)
    if (touch.target.offsetParent.className == "slides") {
      // event.preventDefault();
      var eventID = $(touch.target).parents('article').attr('id');
      var pos = $('#'+eventID+' .slides ul').find('.shown').prevAll().length;
      // console.log($(window).outerWidth());
      if (simulatedEvent.type == "mousedown") {
        initialX = touch.screenX;
        // console.log(initialX);
        $('#'+eventID+' .slides ul').addClass('notransition');
      }
      if (simulatedEvent.type == "mousemove") {
        // console.log(initialX+", "+touch.screenX);
        $('#'+eventID+' .slides ul').css('-webkit-transform','translateX('+(-(pos*$('.slides li').width())+touch.screenX-initialX)+'px)');
      }
      if (simulatedEvent.type == "mouseup") {
      $('#'+eventID+' .slides ul').removeClass('notransition');
        if (initialX - touch.screenX >= 0) {
          if (pos+1!==$('#'+eventID+' .slides ul').find('li').length) {
            pos++
          } 
        }
        else {
          pos--
          if (pos<0) {
            pos = 0
          }
        }
        slides(eventID, pos)
      }
    }   
}

function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}

window.addEventListener('orientationchange', onOrientationChange);
//initial execution on load
onOrientationChange();

$(document).ready(function(){	
  init()
    //once first image is loaded, show it and remove loading graphic
	$('.slides').each(function(){
	    $(this).find('img').load(function(){
	        $(this).parents('.slides').find('li:first-child').addClass('shown');
            $(this).parents('article').find('.slidecaption').eq(0).addClass('shown');
	    });
	});
	$('.dots span:first-child').addClass('active');
	$('.slides:not(.single)').click(function(){
        id = $(this).parents('article').attr('id');
        //for clicking image once on the last slide
        if($(this).find('.shown').prevAll().length+1==$(this).find('li').length){
            pos=0;
        }
        else {
           pos = $(this).find('.shown').prevAll().length+1; 
        };
		slides(id,pos)
	});
	$('.dots span').click(function(){
        id = $(this).parents('article').attr('id');
    	pos = $(this).prevAll().length;
        //if clicking an already active dot       
        if($(this).hasClass('active')==true){
            return
        }
        else {
           slides(id,pos) 
        }
	});
	$(window).load(function(){
		if(window.location.hash.length){setTimeout(scrollToHash,200)}
	});
});

//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-6951101-1', 'marchaumann.net');
ga('send', 'pageview');