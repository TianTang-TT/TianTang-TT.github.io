---
title: js事件顺序执行
date: 2016-10-06 11:51:50
categories: javascript
tags: [javascript, event]
keywords: [js事件, 顺序执行, js监听事件顺序执行, js事件按顺序执行]
---

### 1. 前言
<p>
	前几天朋友问到一个问题,js中的依次绑定多个点击事件，那么这些事件的执行顺序跟绑定顺序有联系吗？当然通过属性绑定事件只能绑定覆盖之前的事件，此处按下不表。通过addEventListener和attachEvent可以为dom对象绑定多个事件，由于某些原因，可能并不会将执行逻辑写到同一个处理程序中，而是在代码执行的不同阶段先后添加了处理不同逻辑的事件，那么事件的执行顺序是按照添加的顺序执行的吗，如果不是，该怎么让事件顺序执行。
</p>

<!-- More -->

### 2. 分析
<p>
    为dom绑定多个事件有两个方法，addEventListener和attachEvent，前者是属于dom2级事件，支持ie9及以上，chrome,ff,通过此方法为dom绑定的事件会按照绑定的先后顺序执行，然而对于ie8以下的浏览器，并不支持dom2级事件，只能使用attachEvent来绑定事件，此方法虽然也可以绑定多个事件，但是事件的执行顺序确实与绑定顺序截然相反。
</p>
    
```javascript
var btn = document.querySelector('btn');
document.addEventListener('click', function () {
    alert('first');
});
document.addEventListener('click', function () {
    alert('second');
});
// 点击按钮之后先弹出'first',后弹出'second'

var btn = document.querySelector('btn');
document.attachEvent('click', function () {
    alert('first');
});
document.attachEvent('click', function () {
    alert('second');
});
// 点击按钮之后先弹出'second',后弹出'first'
```

### 3. 多个事件顺序执行
<p>
    如果因为业务需要一定要让绑定的事件按顺序执行，且支持ie8，那我们不得不对这两种方法做兼容。通过看jquery代码得到启发，我们可以把每次绑定的事件的事件处理程序通过压栈操作压入数组，当事件触发的时候，通过数组的迭代来顺序执行数组中的函数.这样一来，事件处理程序其实是和dom结构完全解耦了，不再是直接绑定在dom上，而是存储在一个数组中。这样一来，事件处理程序的执行作用域可能就会发生变化，那么我们需要在迭代数组的时候将上下文传入，这样就可以完美解决了。
</p>

```javascript
var DomEvent = function (dom) {
	if (!dom) {
		return ;
	}
	this.el = dom;
};
DomEvent.prototype = {
	constructor: DomEvent,
	add: function (type, func) {
		var el = this.el,
			self = this;
			eventList = this[type + 'Events'];
		if (!eventList) {
			if (el.addEventListener) {
				el.addEventListener(type, function () {
					self._fire(type);
				});
			} else if (el.attachEvent) {
				el.attachEvent('on' + type, function () {
					self._fire(type);
				});
			} else {
				el['on' + type] = function () {
					self._fire(type);
				}
			}
			this[type + 'Events'] = [];
		}
		this[type + 'Events'].push(func);
	},
	_fire: function (type) {
		var eventList = this[type + 'Events'];
		if (!eventList) {
			return;
		}
		//ie8不支持forEach,需要做兼容
		eventList.forEach(function (func) {
			func.call(this.el);
		})
	}
};
var div = document.querySelector('#test');
var des = new DomEvent(div);
des.add('click', function () {
	alert('first');
});
des.add('click', function () {
	alert('second');
})
//先弹出first,然后是second
des.add('mouseover', function () {
	alert('over1');
})
des.add('mouseover', function () {
	alert('over2');
})
//鼠标滑过时先弹出over1，然后是over2
```
### 4.原理
<p>
	至此，顺序添加的事件都能顺序执行，且支持ie8（forEeach自己去做兼容），核心思想就是把多个事件合并为一个事件，在这个事件中顺序执行不同时段添加的处理程序，通过数组压栈来控制调用顺序。也就是所有的事件公用一个入口，然后在入口中处理调用顺序，依次调用。
</p>

### 5.缺点
<p>
	使用此方法有个缺点，那就是每个dom结构只能创建一个DomEvent对象，这导致如果需要在不同的作用域下为同一个dom结构绑定事件，必须将DomEvent对象创建在全局下，或者某个相对独立的作用域的父级作用域。如果为同一个dom结构创建对个DomEvent对象，那么将与原生绑定方法无异。
</p>