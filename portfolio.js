function slides(id,pos) {
    $('#'+id+' .slidecaption:not(.single)').removeClass('shown');
    $('#'+id).find('.slidecaption').eq(pos).addClass('shown');
    $('#'+id).find('.slides li').removeClass('shown');
    $('#'+id).find('.slides li').eq(pos).addClass('shown');
    $('#'+id+' .slides ul').css('margin-left',-(pos*$('.slides li').width()));
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
window.addEventListener('orientationchange', onOrientationChange);
//initial execution on load
onOrientationChange();

$(document).ready(function(){	
    //once first image is loaded, show it and remove loading graphic
	$('.slides').each(function(){
	    $(this).find('img').load(function(){
	        $(this).parents('li').addClass('shown');
            $(this).parents('article').find('.slidecaption').eq(0).addClass('shown');
	    });
	});
	$('.dots span:first-child').addClass('active');
	$('.slides:not(.single)').click(function(){
        id = $(this).parents('article').attr('id');
        //for clicking image once on the last slide
        if($(this).find('.shown').prevAll().length+1==$(this).children().length){
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