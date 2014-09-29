/******************************************************************************
Name:    Highslide JS
Version: 4.1.5 (June 26 2009)
Config:  default -outlines -overlays -navigation +positioning
Author:  Torstein Hønsi
Support: http://highslide.com/support

Licence:
Highslide JS is licensed under a Creative Commons Attribution-NonCommercial 2.5
License (http://creativecommons.org/licenses/by-nc/2.5/).

You are free:
	* to copy, distribute, display, and perform the work
	* to make derivative works

Under the following conditions:
	* Attribution. You must attribute the work in the manner  specified by  the
	  author or licensor.
	* Noncommercial. You may not use this work for commercial purposes.

* For  any  reuse  or  distribution, you  must make clear to others the license
  terms of this work.
* Any  of  these  conditions  can  be  waived  if  you  get permission from the 
  copyright holder.

Your fair use and other rights are in no way affected by the above.
******************************************************************************/
var hs = {
// Language strings
lang : {
	cssDirection: 'ltr',
	loadingText : 'Loading...',
	loadingTitle : 'Click to cancel',
	focusTitle : 'Click to bring to front',
	restoreTitle : 'click to close, click and drag to move'
},
// See http://highslide.com/ref for examples of settings  
graphicsDir : 'highslide/graphics/',
expandCursor : null, // null disables
restoreCursor : null, // null disables
expandDuration : 150, // milliseconds
restoreDuration : 150,
marginLeft : 15,
marginRight : 15,
marginTop : 15,
marginBottom : 15,
zIndexCounter : 1001, // adjust to other absolutely positioned elements
loadingOpacity : 0.75,
allowMultipleInstances: true,
numberOfImagesToPreload : 15,
padToMinWidth : false, // pad the popup width to make room for wide caption
openerTagNames : ['a'], // Add more to allow slideshow indexing

anchor : 'auto', // where the image expands from
align : 'auto', // position in the client (overrides anchor)
targetX: null, // the id of a target element
targetY: null,
minWidth: 200,
minHeight: 200,
allowSizeReduction: true, // allow the image to reduce to fit client size. If false, this overrides minWidth and minHeight
// END OF YOUR SETTINGS


// declare internal properties
preloadTheseImages : [],
continuePreloading: true,
expanders : [],
overrides : [
	'allowSizeReduction',
	'useBox',
	'anchor',
	'align',
	'targetX',
	'targetY',
	
	'width',
	'height',
	
	'wrapperClassName',
	'minWidth',
	'minHeight',
	'maxWidth',
	'maxHeight',
	'slideshowGroup',
	'easing',
	'easingClose',
	'fadeInOut',
	'src'
],
timers : [],
clones : {},
onReady: [],
uaVersion: parseFloat((navigator.userAgent.toLowerCase().match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1]),
ie : (document.all && !window.opera),
safari : /Safari/.test(navigator.userAgent),
geckoMac : /Macintosh.+rv:1\.[0-8].+Gecko/.test(navigator.userAgent),

$ : function (id) {
	if (id) return document.getElementById(id);
},

push : function (arr, val) {
	arr[arr.length] = val;
},

createElement : function (tag, attribs, styles, parent, nopad) {
	var el = document.createElement(tag);
	if (attribs) hs.extend(el, attribs);
	if (nopad) hs.setStyles(el, {padding: 0, border: 'none', margin: 0});
	if (styles) hs.setStyles(el, styles);
	if (parent) parent.appendChild(el);	
	return el;
},

extend : function (el, attribs) {
	for (var x in attribs) el[x] = attribs[x];
	return el;
},

setStyles : function (el, styles) {
	for (var x in styles) {
		if (hs.ie && x == 'opacity') {
			if (styles[x] > 0.99) el.style.removeAttribute('filter');
			else el.style.filter = 'alpha(opacity='+ (styles[x] * 100) +')';
		}
		else el.style[x] = styles[x];
	}
},
animate: function(el, prop, opt) {
	var start,
		end,
		unit;
	if (typeof opt != 'object' || opt === null) {
		var args = arguments;
		opt = {
			duration: args[2],
			easing: args[3],
			complete: args[4]
		};
	}
	if (typeof opt.duration != 'number') opt.duration = 250;
	opt.easing = Math[opt.easing] || Math.easeInQuad;
	opt.curAnim = hs.extend({}, prop);
	for (var name in prop) {
		var e = new hs.fx(el, opt , name );
		
		start = parseFloat(hs.css(el, name)) || 0;
		end = parseFloat(prop[name]);
		unit = name != 'opacity' ? 'px' : '';
		
		e.custom( start, end, unit );
	}	
},
css: function(el, prop) {
	if (document.defaultView) {
		return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);

	} else {
		if (prop == 'opacity') prop = 'filter';
		var val = el.currentStyle[prop.replace(/\-(\w)/g, function (a, b){ return b.toUpperCase(); })];
		if (prop == 'filter') 
			val = val.replace(/alpha\(opacity=([0-9]+)\)/, 
				function (a, b) { return b / 100 });
		return val === '' ? 1 : val;
	} 
},

getPageSize : function () {
	var d = document, w = window, iebody = d.compatMode && d.compatMode != 'BackCompat' 
		? d.documentElement : d.body;
	
	var width = hs.ie ? iebody.clientWidth : 
			(d.documentElement.clientWidth || self.innerWidth),
		height = hs.ie ? iebody.clientHeight : self.innerHeight;
	
	hs.page = {
		width: width,
		height: height,		
		scrollLeft: hs.ie ? iebody.scrollLeft : pageXOffset,
		scrollTop: hs.ie ? iebody.scrollTop : pageYOffset
	}
},

getPosition : function(el)	{
	var p = { x: el.x, y: el.y };

	return p;
},

getPositionorig : function(el)	{
	var p = { x: el.offsetLeft, y: el.offsetTop };
	while (el.offsetParent)	{
		el = el.offsetParent;
		p.x += el.offsetLeft;
		p.y += el.offsetTop;
		if (el != document.body && el != document.documentElement) {
			p.x -= el.scrollLeft;
			p.y -= el.scrollTop;
		}
	}
	return p;
},

expand : function(a, params, custom, type) {
	if (!a) a = hs.createElement('a', null, { display: 'none' }, hs.container);
	if (typeof a.getParams == 'function') return params;	
	try {	
		new hs.Expander(a, params, custom);
		return false;
	} catch (e) { return true; }
},


focusTopmost : function() {
	var topZ = 0, 
		topmostKey = -1,
		expanders = hs.expanders,
		exp,
		zIndex;
	for (var i = 0; i < expanders.length; i++) {
		exp = expanders[i];
		if (exp) {
			zIndex = exp.wrapper.style.zIndex;
			if (zIndex && zIndex > topZ) {
				topZ = zIndex;				
				topmostKey = i;
			}
		}
	}
	if (topmostKey == -1) hs.focusKey = -1;
	else expanders[topmostKey].focus();
},

getParam : function (a, param) {
	a.getParams = a.onclick;
	var p = a.getParams ? a.getParams() : null;
	a.getParams = null;
	
	return (p && typeof p[param] != 'undefined') ? p[param] : 
		(typeof hs[param] != 'undefined' ? hs[param] : null);
},

getSrc : function (a) {
	var src = hs.getParam(a, 'src');
	if (src) return src;
	return a.href;
},

discardElement : function(d) {
	if (d) hs.garbageBin.appendChild(d);
	hs.garbageBin.innerHTML = '';
},



getWrapperKey : function (element, expOnly) {
	var el, re = /^highslide-wrapper-([0-9]+)$/;
	// 1. look in open expanders
	el = element;
	while (el.parentNode)	{
		if (el.id && re.test(el.id)) return el.id.replace(re, "$1");
		el = el.parentNode;
	}
	// 2. look in thumbnail
	if (!expOnly) {
		el = element;
		while (el.parentNode)	{
			if (el.tagName && hs.isHsAnchor(el)) {
				for (var key = 0; key < hs.expanders.length; key++) {
					var exp = hs.expanders[key];
					if (exp && exp.a == el) return key;
				}
			}
			el = el.parentNode;
		}
	}
	return null; 
},

getExpander : function (el, expOnly) {
	if (typeof el == 'undefined') return hs.expanders[hs.focusKey] || null;
	if (typeof el == 'number') return hs.expanders[el] || null;
	if (typeof el == 'string') el = hs.$(el);
	return hs.expanders[hs.getWrapperKey(el, expOnly)] || null;
},

isHsAnchor : function (a) {
	return (a.onclick && a.onclick.toString().replace(/\s/g, ' ').match(/hs.(htmlE|e)xpand/));
},

reOrder : function () {
	for (var i = 0; i < hs.expanders.length; i++)
		if (hs.expanders[i] && hs.expanders[i].isExpanded) hs.focusTopmost();
},

mouseClickHandler : function(e) 
{	
	if (!e) e = window.event;
	if (e.button > 1) return true;
	if (!e.target) e.target = e.srcElement;
	
	var el = e.target;
	while (el.parentNode
		&& !(/highslide-(image|move|html|resize)/.test(el.className)))
	{
		el = el.parentNode;
	}
	var exp = hs.getExpander(el);
	if (exp && (exp.isClosing || !exp.isExpanded)) return true;
		
	if (exp && e.type == 'mousedown') {
		if (e.target.form) return true;
		var match = el.className.match(/highslide-(image|move|resize)/);
		if (match) {
			hs.dragArgs = { exp: exp , type: match[1], left: exp.x.pos, width: exp.x.size, top: exp.y.pos, 
				height: exp.y.size, clickX: e.clientX, clickY: e.clientY };
			
			
			hs.addEventListener(document, 'mousemove', hs.dragHandler);
			if (e.preventDefault) e.preventDefault(); // FF
			
			if (/highslide-(image|html)-blur/.test(exp.content.className)) {
				exp.focus();
				hs.hasFocused = true;
			}
			return false;
		}
	} else if (e.type == 'mouseup') {
		
		hs.removeEventListener(document, 'mousemove', hs.dragHandler);
		
		if (hs.dragArgs) {
			if (hs.styleRestoreCursor && hs.dragArgs.type == 'image') 
				hs.dragArgs.exp.content.style.cursor = hs.styleRestoreCursor;
			var hasDragged = hs.dragArgs.hasDragged;
			
			if (!hasDragged &&!hs.hasFocused && !/(move|resize)/.test(hs.dragArgs.type)) {
				exp.close();
			} 
			else if (hasDragged || (!hasDragged && hs.hasHtmlExpanders)) {
				hs.dragArgs.exp.doShowHide('hidden');
			}
			
			hs.hasFocused = false;
			hs.dragArgs = null;
		
		} else if (/highslide-image-blur/.test(el.className)) {
			el.style.cursor = hs.styleRestoreCursor;		
		}
	}
	return false;
},

dragHandler : function(e)
{
	if (!hs.dragArgs) return true;
	if (!e) e = window.event;
	var a = hs.dragArgs, exp = a.exp;
	
	a.dX = e.clientX - a.clickX;
	a.dY = e.clientY - a.clickY;	
	
	var distance = Math.sqrt(Math.pow(a.dX, 2) + Math.pow(a.dY, 2));
	if (!a.hasDragged) a.hasDragged = (a.type != 'image' && distance > 0)
		|| (distance > (hs.dragSensitivity || 5));
	
	if (a.hasDragged && e.clientX > 5 && e.clientY > 5) {
		
		if (a.type == 'resize') exp.resize(a);
		else {
			exp.moveTo(a.left + a.dX, a.top + a.dY);
			if (a.type == 'image') exp.content.style.cursor = 'move';
		}
	}
	return false;
},
addEventListener : function (el, event, func) {
	if (el == document && event == 'ready') hs.push(hs.onReady, func);
	try {
		el.addEventListener(event, func, false);
	} catch (e) {
		try {
			el.detachEvent('on'+ event, func);
			el.attachEvent('on'+ event, func);
		} catch (e) {
			el['on'+ event] = func;
		}
	} 
},

removeEventListener : function (el, event, func) {
	try {
		el.removeEventListener(event, func, false);
	} catch (e) {
		try {
			el.detachEvent('on'+ event, func);
		} catch (e) {
			el['on'+ event] = null;
		}
	}
},

preloadFullImage : function (i) {
	if (hs.continuePreloading && hs.preloadTheseImages[i] && hs.preloadTheseImages[i] != 'undefined') {
		var img = document.createElement('img');
		img.onload = function() { 
			img = null;
			hs.preloadFullImage(i + 1);
		};
		img.src = hs.preloadTheseImages[i];
	}
},
preloadImages : function (number) {
	if (number && typeof number != 'object') hs.numberOfImagesToPreload = number;
	
	var arr = hs.getAnchors();
	for (var i = 0; i < arr.images.length && i < hs.numberOfImagesToPreload; i++) {
		hs.push(hs.preloadTheseImages, hs.getSrc(arr.images[i]));
	}
	
	hs.preloadFullImage(0);
	
	// preload cursor
	if (hs.restoreCursor) var cur = hs.createElement('img', { src: hs.graphicsDir + hs.restoreCursor });
},


init : function () {
	if (!hs.container) {
	
		hs.getPageSize();
		hs.ieLt7 = hs.ie && hs.uaVersion < 7;
		for (var x in hs.langDefaults) {
			if (typeof hs[x] != 'undefined') hs.lang[x] = hs[x];
			else if (typeof hs.lang[x] == 'undefined' && typeof hs.langDefaults[x] != 'undefined') 
				hs.lang[x] = hs.langDefaults[x];
		}
		
		hs.container = hs.createElement('div', {
				className: 'highslide-container'
			}, {
				position: 'absolute', 
				left: 0, 
				top: 0, 
				width: '100%', 
				zIndex: hs.zIndexCounter,
				direction: 'ltr'
			}, 
			document.body,
			true
		);
		hs.loading = hs.createElement('a', {
				className: 'highslide-loading',
				title: hs.lang.loadingTitle,
				innerHTML: hs.lang.loadingText,
				href: 'javascript:;'
			}, {
				position: 'absolute',
				top: '-9999px',
				opacity: hs.loadingOpacity,
				zIndex: 1
			}, hs.container
		);
		hs.garbageBin = hs.createElement('div', null, { display: 'none' }, hs.container);
		
		// http://www.robertpenner.com/easing/ 
		Math.linearTween = function (t, b, c, d) {
			return c*t/d + b;
		};
		Math.easeInQuad = function (t, b, c, d) {
			return c*(t/=d)*t + b;
		};
		
		hs.hideSelects = hs.ieLt7;
		hs.hideIframes = ((window.opera && hs.uaVersion < 9) || navigator.vendor == 'KDE' 
			|| (hs.ie && hs.uaVersion < 5.5));
	}
},
ready : function() {
	if (hs.isReady) return;
	hs.isReady = true;
	
	for (var i = 0; i < hs.onReady.length; i++) hs.onReady[i]();
},

updateAnchors : function() {
	var el, els, all = [], images = [],groups = {}, re;
		
	for (var i = 0; i < hs.openerTagNames.length; i++) {
		els = document.getElementsByTagName(hs.openerTagNames[i]);
		for (var j = 0; j < els.length; j++) {
			el = els[j];
			re = hs.isHsAnchor(el);
			if (re) {
				hs.push(all, el);
				if (re[0] == 'hs.expand') hs.push(images, el);
				var g = hs.getParam(el, 'slideshowGroup') || 'none';
				if (!groups[g]) groups[g] = [];
				hs.push(groups[g], el);
			}
		}
	}
	hs.anchors = { all: all, groups: groups, images: images };
	return hs.anchors;
	
},

getAnchors : function() {
	return hs.anchors || hs.updateAnchors();
},


close : function(el) {
	var exp = hs.getExpander(el);
	if (exp) exp.close();
	return false;
}
}; // end hs object
hs.fx = function( elem, options, prop ){
	this.options = options;
	this.elem = elem;
	this.prop = prop;

	if (!options.orig) options.orig = {};
};
hs.fx.prototype = {
	update: function(){
		(hs.fx.step[this.prop] || hs.fx.step._default)(this);
		
		if (this.options.step)
			this.options.step.call(this.elem, this.now, this);

	},
	custom: function(from, to, unit){
		this.startTime = (new Date()).getTime();
		this.start = from;
		this.end = to;
		this.unit = unit;// || this.unit || "px";
		this.now = this.start;
		this.pos = this.state = 0;

		var self = this;
		function t(gotoEnd){
			return self.step(gotoEnd);
		}

		t.elem = this.elem;

		if ( t() && hs.timers.push(t) == 1 ) {
			hs.timerId = setInterval(function(){
				var timers = hs.timers;

				for ( var i = 0; i < timers.length; i++ )
					if ( !timers[i]() )
						timers.splice(i--, 1);

				if ( !timers.length ) {
					clearInterval(hs.timerId);
				}
			}, 13);
		}
	},
	step: function(gotoEnd){
		var t = (new Date()).getTime();
		if ( gotoEnd || t >= this.options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			this.options.curAnim[ this.prop ] = true;

			var done = true;
			for ( var i in this.options.curAnim )
				if ( this.options.curAnim[i] !== true )
					done = false;

			if ( done ) {
				if (this.options.complete) this.options.complete.call(this.elem);
			}
			return false;
		} else {
			var n = t - this.startTime;
			this.state = n / this.options.duration;
			this.pos = this.options.easing(n, 0, 1, this.options.duration);
			this.now = this.start + ((this.end - this.start) * this.pos);
			this.update();
		}
		return true;
	}

};

hs.extend( hs.fx, {
	step: {

		opacity: function(fx){
			hs.setStyles(fx.elem, { opacity: fx.now });
		},

		_default: function(fx){
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null )
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			else
				fx.elem[ fx.prop ] = fx.now;
		}
	}
});

hs.Dimension = function(exp, dim) {
	this.exp = exp;
	this.dim = dim;
	this.ucwh = dim == 'x' ? 'Width' : 'Height';
	this.wh = this.ucwh.toLowerCase();
	this.uclt = dim == 'x' ? 'Left' : 'Top';
	this.lt = this.uclt.toLowerCase();
	this.ucrb = dim == 'x' ? 'Right' : 'Bottom';
	this.rb = this.ucrb.toLowerCase();
};
hs.Dimension.prototype = {
get : function(key) {
	switch (key) {
		case 'loadingPos':
			return this.tpos + this.tb + (this.t - hs.loading['offset'+ this.ucwh]) / 2;
		case 'wsize':
			return this.size + 2 * this.cb;
		case 'fitsize':
			return this.clientSize - this.marginMin - this.marginMax;
		case 'maxsize':
			return this.get('fitsize') - 2 * this.cb ;
		case 'opos':
			return this.pos;
		case 'osize':
			return this.get('wsize');
		case 'imgPad':
			return this.imgSize ? Math.round((this.size - this.imgSize) / 2) : 0;
		
	}
},
calcBorders: function() {
	// correct for borders
	this.cb = (this.exp.content['offset'+ this.ucwh] - this.t) / 2;
	this.marginMax = hs['margin'+ this.ucrb];
},
calcThumb: function() {
	this.t = this.exp.el[this.wh] ? parseInt(this.exp.el[this.wh]) : 
		this.exp.el['offset'+ this.ucwh];
	this.tpos = this.exp.tpos[this.dim];
	this.tb = (this.exp.el['offset'+ this.ucwh] - this.t) / 2;
	if (this.tpos < 1) {
		this.tpos = (hs.page[this.wh] / 2) + hs.page['scroll'+ this.uclt];		
	};
},
calcExpanded: function() {
	var exp = this.exp;
	this.justify = 'auto';
	
	// get alignment
	if (exp.align == 'center') this.justify = 'center';
	else if (new RegExp(this.lt).test(exp.anchor)) this.justify = null;
	else if (new RegExp(this.rb).test(exp.anchor)) this.justify = 'max';
	
	
	// size and position
	this.pos = this.tpos - this.cb + this.tb;
	this.size = Math.min(this.full, exp['max'+ this.ucwh] || this.full);
	this.minSize = exp.allowSizeReduction ? 
		Math.min(exp['min'+ this.ucwh], this.full) :this.full;
	if (exp.isImage && exp.useBox)	{
		this.size = exp[this.wh];
		this.imgSize = this.full;
	}
	if (this.dim == 'x' && hs.padToMinWidth) this.minSize = exp.minWidth;
	this.target = exp['target'+ this.dim.toUpperCase()];
	this.marginMin = hs['margin'+ this.uclt];
	this.scroll = hs.page['scroll'+ this.uclt];
	this.clientSize = hs.page[this.wh];
},
setSize: function(i) {
	var exp = this.exp;
	if (exp.isImage && (exp.useBox || hs.padToMinWidth)) {
		this.imgSize = i;
		this.size = Math.max(this.size, this.imgSize);
		exp.content.style[this.lt] = this.get('imgPad')+'px';
	} else
	this.size = i;

	exp.content.style[this.wh] = i +'px';
	exp.wrapper.style[this.wh] = this.get('wsize') +'px';
},
setPos: function(i) {
	this.pos = i;
	this.exp.wrapper.style[this.lt] = i +'px';	
	
}
};

hs.Expander = function(a, params, custom, contentType) {
	if (document.readyState && hs.ie && !hs.isReady) {
		hs.addEventListener(document, 'ready', function() {
			new hs.Expander(a, params, custom, contentType);
		});
		return;
	} 
	this.a = a;
	this.custom = custom;
	this.contentType = contentType || 'image';
	this.isImage = !this.isHtml;
	
	hs.continuePreloading = false;
	hs.init();
	var key = this.key = hs.expanders.length;
	// override inline parameters
	for (var i = 0; i < hs.overrides.length; i++) {
		var name = hs.overrides[i];
		this[name] = params && typeof params[name] != 'undefined' ?
			params[name] : hs[name];
	}
	if (!this.src) this.src = a.href;
	
	// get thumb
	var el = (params && params.thumbnailId) ? hs.$(params.thumbnailId) : a;
	el = this.thumb = el.getElementsByTagName('img')[0] || el;
	this.thumbsUserSetId = el.id || a.id;
	
	// check if already open
	for (var i = 0; i < hs.expanders.length; i++) {
		if (hs.expanders[i] && hs.expanders[i].a == a) {
			hs.expanders[i].focus();
			return false;
		}
	}	

	// cancel other
	if (!hs.allowSimultaneousLoading) for (var i = 0; i < hs.expanders.length; i++) {
		if (hs.expanders[i] && hs.expanders[i].thumb != el && !hs.expanders[i].onLoadStarted) {
			hs.expanders[i].cancelLoading();
		}
	}
	hs.expanders[key] = this;
	if (!hs.allowMultipleInstances && !hs.upcoming) {
		if (hs.expanders[key-1]) hs.expanders[key-1].close();
		if (typeof hs.focusKey != 'undefined' && hs.expanders[hs.focusKey])
			hs.expanders[hs.focusKey].close();
	}
	
	// initiate metrics
	this.el = el;
	this.tpos = hs.getPosition(el);
	hs.getPageSize();
	var x = this.x = new hs.Dimension(this, 'x');
	x.calcThumb();
	var y = this.y = new hs.Dimension(this, 'y');
	y.calcThumb();
	this.wrapper = hs.createElement(
		'div', {
			id: 'highslide-wrapper-'+ this.key,
			className: 'highslide-wrapper '+ this.wrapperClassName
		}, {
			visibility: 'hidden',
			position: 'absolute',
			zIndex: hs.zIndexCounter += 2
		}, null, true );
		this[this.contentType +'Create']();
	return true;
};

hs.Expander.prototype = {
error : function(e) {
	//alert ('Line '+ e.lineNumber +': '+ e.message);
	window.location.href = this.src;
},

showLoading : function() {
	if (this.onLoadStarted || this.loading) return;
	
	this.loading = hs.loading;
	var exp = this;
	this.loading.onclick = function() {
		exp.cancelLoading();
	};
	var exp = this, 
		l = this.x.get('loadingPos') +'px',
		t = this.y.get('loadingPos') +'px';
	setTimeout(function () { 
		if (exp.loading) hs.setStyles(exp.loading, { left: l, top: t, zIndex: hs.zIndexCounter++ })}
	, 100);
},

imageCreate : function() {
	var exp = this;
	
	var img = document.createElement('img');
    this.content = img;
    img.onload = function () {
    	if (hs.expanders[exp.key]) exp.contentLoaded(); 
	};
    if (hs.blockRightClick) img.oncontextmenu = function() { return false; };
    img.className = 'highslide-image';
    hs.setStyles(img, {
    	visibility: 'hidden',
    	display: 'block',
    	position: 'absolute',
		maxWidth: '9999px',
		zIndex: 3
	});
    img.title = hs.lang.restoreTitle;
    if (hs.safari) hs.container.appendChild(img);
    if (hs.ie && hs.flushImgSize) img.src = null;
	img.src = this.src;
	
	this.showLoading();
},

contentLoaded : function() {
	try {	
		if (!this.content) return;
		this.content.onload = null;
		if (this.onLoadStarted) return;
		else this.onLoadStarted = true;
		
		var x = this.x, y = this.y;
		
		if (this.loading) {
			hs.setStyles(this.loading, { top: '-9999px' });
			this.loading = null;
		}	
			x.full = this.content.width;
			y.full = this.content.height;
			
			hs.setStyles(this.content, {
				width: x.t +'px',
				height: y.t +'px'
			});
			this.wrapper.appendChild(this.content);
			hs.container.appendChild(this.wrapper);
		
		x.calcBorders();
		y.calcBorders();
		
		hs.setStyles (this.wrapper, {
			left: (x.tpos + x.tb - x.cb) +'px',
			top: (y.tpos + x.tb - y.cb) +'px'
		});
		
		var ratio = x.full / y.full;
		
		x.calcExpanded();
		this.justify(x);
		
		y.calcExpanded();
		this.justify(y);
		
		if (this.allowSizeReduction) {
				this.correctRatio(ratio);
			if (this.isImage && this.x.full > (this.x.imgSize || this.x.size)) {
				this.createFullExpand();
				if (this.overlays.length == 1) this.sizeOverlayBox();
			}
		}
		this.show();
		
	} catch (e) {
		this.error(e);
	}
},

justify : function (p, moveOnly) {
	var tgtArr, tgt = p.target, dim = p == this.x ? 'x' : 'y';
	
	if (tgt && tgt.match(/ /)) {
		tgtArr = tgt.split(' ');
		tgt = tgtArr[0];
	}
	if (tgt && hs.$(tgt)) {
		p.pos = hs.getPosition(hs.$(tgt))[dim];
		if (tgtArr && tgtArr[1] && tgtArr[1].match(/^[-]?[0-9]+px$/)) 
			p.pos += parseInt(tgtArr[1]);
		if (p.size < p.minSize) p.size = p.minSize;
		
	} else if (p.justify == 'auto' || p.justify == 'center') {
	
		var hasMovedMin = false;
		
		var allowReduce = p.exp.allowSizeReduction;
		if (p.justify == 'center')
			p.pos = Math.round(p.scroll + (p.clientSize + p.marginMin - p.marginMax - p.get('wsize')) / 2);
		else
			p.pos = Math.round(p.pos - ((p.get('wsize') - p.t) / 2));
		if (p.pos < p.scroll + p.marginMin) {
			p.pos = p.scroll + p.marginMin;
			hasMovedMin = true;		
		}
		if (!moveOnly && p.size < p.minSize) {
			p.size = p.minSize;
			allowReduce = false;
		}
		if (p.pos + p.get('wsize') > p.scroll + p.clientSize - p.marginMax) {
			if (!moveOnly && hasMovedMin && allowReduce) {
				p.size = p.get(dim == 'y' ? 'fitsize' : 'maxsize');
			} else if (p.get('wsize') < p.get('fitsize')) {
				p.pos = p.scroll + p.clientSize - p.marginMax - p.get('wsize');
			} else { // image larger than viewport
				p.pos = p.scroll + p.marginMin;
				if (!moveOnly && allowReduce) p.size = p.get(dim == 'y' ? 'fitsize' : 'maxsize');
			}			
		}
		
		if (!moveOnly && p.size < p.minSize) {
			p.size = p.minSize;
			allowReduce = false;
		}
		
	
	} else if (p.justify == 'max') {
		p.pos = Math.floor(p.pos - p.size + p.t);
	}
	
		
	if (p.pos < p.marginMin) {
		var tmpMin = p.pos;
		p.pos = p.marginMin; 
		
		if (allowReduce && !moveOnly) p.size = p.size - (p.pos - tmpMin);
		
	}
},

correctRatio : function(ratio) {
	var x = this.x, 
		y = this.y,
		changed = false,
		xSize = Math.min(x.full, x.size),
		ySize = Math.min(y.full, y.size),
		useBox = (this.useBox || hs.padToMinWidth);
	
	if (xSize / ySize > ratio) { // width greater
		xSize = ySize * ratio;
		if (xSize < x.minSize) { // below minWidth
			xSize = x.minSize;
			ySize = xSize / ratio;
		}
		changed = true;
	
	} else if (xSize / ySize < ratio) { // height greater
		ySize = xSize / ratio;
		changed = true;
	}
	
	if (hs.padToMinWidth && x.full < x.minSize) {
		x.imgSize = x.full;
		y.size = y.imgSize = y.full;
	} else if (this.useBox) {
		x.imgSize = xSize;
		y.imgSize = ySize;
	} else {
		x.size = xSize;
		y.size = ySize;
	}
	if (useBox && y.size < y.imgSize) {
		y.imgSize = y.size;
		x.imgSize = y.size * ratio;
	}
	if (changed || useBox) {
		x.pos = x.tpos - x.cb + x.tb;
		x.minSize = x.size;
		this.justify(x, true);
	
		y.pos = y.tpos - y.cb + y.tb;
		y.minSize = y.size;
		this.justify(y, true);
		if (this.overlayBox) this.sizeOverlayBox();
	}
},

show : function () {
	var x = this.x, y = this.y;
	this.doShowHide('hidden');
	
	// Apply size change
	this.changeSize(
		1, {
			wrapper: {
				width : x.get('wsize'),
				height : y.get('wsize'),
				left: x.pos,
				top: y.pos
			},
			content: {
				left: x.p1 + x.get('imgPad'),
				top: y.p1 + y.get('imgPad'),
				width:x.imgSize ||x.size,
				height:y.imgSize ||y.size
			}
		},
		hs.expandDuration
	);
},

changeSize : function(up, to, dur) {
	
	var exp = this,
		x = exp.x,
		y = exp.y,
		easing = this.easing;
	if (!up) easing = this.easingClose || easing;
	var after = up ?
		function() {
			setTimeout(function() {
				exp.afterExpand();
			}, 50);
		} :
		function() {
			exp.afterClose();
		};
	if (up) hs.setStyles( this.wrapper, {
		width: x.t +'px',
		height: y.t +'px'
	});
	if (this.fadeInOut) {
		hs.setStyles(this.wrapper, { opacity: up ? 0 : 1 });
		hs.extend(to.wrapper, { opacity: up });
	}
	hs.animate( this.wrapper, to.wrapper, {
		duration: dur,
		easing: easing,
		step: function(val, args) {
		}
	});
	hs.animate( this.content, to.content, dur, easing, after);
	if (up) {
		this.wrapper.style.visibility = 'visible';
		this.content.style.visibility = 'visible';
		this.a.className += ' highslide-active-anchor';
	}
},




afterExpand : function() {
	this.isExpanded = true;	
	this.focus();
	
},



preloadNext : function() {
	var next = this.getAdjacentAnchor(1);
	if (next && next.onclick.toString().match(/hs\.expand/)) 
		var img = hs.createElement('img', { src: hs.getSrc(next) });
},


getAdjacentAnchor : function(op) {
	var current = this.getAnchorIndex(), as = hs.anchors.groups[this.slideshowGroup || 'none'];
	
	/*< ? if ($cfg->slideshow) : ?>s*/
	if (!as[current + op] && this.slideshow && this.slideshow.repeat) {
		if (op == 1) return as[0];
		else if (op == -1) return as[as.length-1];
	}
	/*< ? endif ?>s*/
	return as[current + op] || null;
},

getAnchorIndex : function() {
	var arr = hs.getAnchors().groups[this.slideshowGroup || 'none'];
	if (arr) for (var i = 0; i < arr.length; i++) {
		if (arr[i] == this.a) return i; 
	}
	return null;
},


cancelLoading : function() {
	hs.discardElement (this.wrapper);
	hs.expanders[this.key] = null;
	if (this.loading) hs.loading.style.left = '-9999px';
},


// on end move and resize
doShowHide : function(visibility) {
	if (hs.hideSelects) this.showHideElements('SELECT', visibility);
	if (hs.hideIframes) this.showHideElements('IFRAME', visibility);
	if (hs.geckoMac) this.showHideElements('*', visibility);
},
showHideElements : function (tagName, visibility) {
	var els = document.getElementsByTagName(tagName);
	var prop = tagName == '*' ? 'overflow' : 'visibility';
	for (var i = 0; i < els.length; i++) {
		if (prop == 'visibility' || (document.defaultView.getComputedStyle(
				els[i], "").getPropertyValue('overflow') == 'auto'
				|| els[i].getAttribute('hidden-by') != null)) {
			var hiddenBy = els[i].getAttribute('hidden-by');
			if (visibility == 'visible' && hiddenBy) {
				hiddenBy = hiddenBy.replace('['+ this.key +']', '');
				els[i].setAttribute('hidden-by', hiddenBy);
				if (!hiddenBy) els[i].style[prop] = els[i].origProp;
			} else if (visibility == 'hidden') { // hide if behind
				var elPos = hs.getPosition(els[i]);
				elPos.w = els[i].offsetWidth;
				elPos.h = els[i].offsetHeight;
			
				
					var clearsX = (elPos.x + elPos.w < this.x.get('opos') 
						|| elPos.x > this.x.get('opos') + this.x.get('osize'));
					var clearsY = (elPos.y + elPos.h < this.y.get('opos') 
						|| elPos.y > this.y.get('opos') + this.y.get('osize'));
				var wrapperKey = hs.getWrapperKey(els[i]);
				if (!clearsX && !clearsY && wrapperKey != this.key) { // element falls behind image
					if (!hiddenBy) {
						els[i].setAttribute('hidden-by', '['+ this.key +']');
						els[i].origProp = els[i].style[prop];
						els[i].style[prop] = 'hidden';
						
					} else if (hiddenBy.indexOf('['+ this.key +']') == -1) {
						els[i].setAttribute('hidden-by', hiddenBy + '['+ this.key +']');
					}
				} else if ((hiddenBy == '['+ this.key +']' || hs.focusKey == wrapperKey)
						&& wrapperKey != this.key) { // on move
					els[i].setAttribute('hidden-by', '');
					els[i].style[prop] = els[i].origProp || '';
				} else if (hiddenBy && hiddenBy.indexOf('['+ this.key +']') > -1) {
					els[i].setAttribute('hidden-by', hiddenBy.replace('['+ this.key +']', ''));
				}
						
			}
		}
	}
},

focus : function() {
	this.wrapper.style.zIndex = hs.zIndexCounter += 2;
	// blur others
	for (var i = 0; i < hs.expanders.length; i++) {
		if (hs.expanders[i] && i == hs.focusKey) {
			var blurExp = hs.expanders[i];
			blurExp.content.className += ' highslide-'+ blurExp.contentType +'-blur';
				blurExp.content.style.cursor = hs.ie ? 'hand' : 'pointer';
				blurExp.content.title = hs.lang.focusTitle;
		}
	}
	
	// focus this
	this.content.className = 'highslide-'+ this.contentType;
		this.content.title = hs.lang.restoreTitle;
		
		if (hs.restoreCursor) {
			hs.styleRestoreCursor = window.opera ? 'pointer' : 'url('+ hs.graphicsDir + hs.restoreCursor +'), pointer';
			if (hs.ie && hs.uaVersion < 6) hs.styleRestoreCursor = 'hand';
			this.content.style.cursor = hs.styleRestoreCursor;
		}
		
	hs.focusKey = this.key;	
},
moveTo: function(x, y) {
	this.x.setPos(x);
	this.y.setPos(y);
},
resize : function (e) {
	var w, h, r = e.width / e.height;
	w = Math.max(e.width + e.dX, Math.min(this.minWidth, this.x.full));
	if (this.isImage && Math.abs(w - this.x.full) < 12) w = this.x.full;
	h = w / r;
	if (h < Math.min(this.minHeight, this.y.full)) {
		h = Math.min(this.minHeight, this.y.full);
		if (this.isImage) w = h * r;
	}
	this.resizeTo(w, h);
},
resizeTo: function(w, h) {
	this.y.setSize(h);
	this.x.setSize(w);
},

close : function() {
	if (this.isClosing || !this.isExpanded) return;
	this.isClosing = true;
	
	try {
		this.content.style.cursor = 'default';
		this.changeSize(
			0, {
				wrapper: {
					width : this.x.t,
					height : this.y.t,
					left: this.x.tpos - this.x.cb + this.x.tb,
					top: this.y.tpos - this.y.cb + this.y.tb
				},
				content: {
					left: 0,
					top: 0,
					width: this.x.t,
					height: this.y.t
				}
			}, hs.restoreDuration
		);
	} catch (e) { this.afterClose(); }
},



afterClose : function () {
	this.a.className = this.a.className.replace('highslide-active-anchor', '');
	
	this.doShowHide('visible');
	
		hs.discardElement(this.wrapper);
	
	hs.expanders[this.key] = null;		
	hs.reOrder();
}

};
if (hs.ie) {
	(function () {
		try {
			document.documentElement.doScroll('left');
		} catch (e) {
			setTimeout(arguments.callee, 50);
			return;
		}
		hs.ready();
	})();
}
hs.addEventListener(document, 'DOMContentLoaded', hs.ready);
hs.addEventListener(window, 'load', hs.ready);
hs.langDefaults = hs.lang;
// history
var HsExpander = hs.Expander;

// set handlers
hs.addEventListener(window, 'load', function() {
	if (hs.expandCursor) {
		var sel = '.highslide img', 
			dec = 'cursor: url('+ hs.graphicsDir + hs.expandCursor +'), pointer !important;';
			
		var style = hs.createElement('style', { type: 'text/css' }, null, 
			document.getElementsByTagName('HEAD')[0]);
	
		if (!hs.ie) {
			style.appendChild(document.createTextNode(sel + " {" + dec + "}"));
		} else {
			var last = document.styleSheets[document.styleSheets.length - 1];
			if (typeof(last.addRule) == "object") last.addRule(sel, dec);
		}
	}
});
hs.addEventListener(window, 'resize', function() {
	hs.getPageSize();
});
hs.addEventListener(document, 'mousedown', hs.mouseClickHandler);
hs.addEventListener(document, 'mouseup', hs.mouseClickHandler);

hs.addEventListener(document, 'ready', hs.getAnchors);
hs.addEventListener(window, 'load', hs.preloadImages);