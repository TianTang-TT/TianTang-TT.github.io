---
title: jsonp跨域的原理
date: 2016-12-01 17:26:07
categories: javascript
tags: [javascript, jsonp]
keywords: [jsonp跨域原理, 跨域, jsonp, 原理, jsonp原理, jsonp跨域实质, 深入理解jsonp]
---


### 1. 前言
<p>
	jsonp是一种常用的跨域手段，和反向代理，服务端做跨域处理相比，jsonp更显得方便轻巧，因而被大量用来处理跨域的请求，那么，这种请求方式到底是用了什么黑魔法，来解决令我们头疼的跨域问题。
</p>

<!--more-->

### 2. 原理
<p>
	jsonp其实并没有用到什么黑魔法，能达到跨域这种效果，无非是利用script标签自身的跨域能力。我们知道，img,script,这种标签如果有相应的src，那么便会发起一个htttp请求来请求相应的资源,如果有script标签对应的路径是一个js文件，那么在下载完毕这个js之后会马上执行
</p>

```html
<script type="text/javascript" src="www.somewhere.com/test.js"></script>
<!--此时会发起一个请求来获取test.js，下载完成之后会立即执行test.js-->
```
<p>
    假设我们需要从'www.localhost.com'发起一个获取数据的请求'www.somewhere.com/getdata',如果有我们以ajax来发起请求，那么由于浏览器同源保护策略的限制，该请求的返回值不会被浏览器所接受，这就是跨域问题。但是script这种标签会发起一个get请求，并且这个请求是不受同源策略限制的，如果有我们将'www.somewhere.com/getdata'以script标签来发送变成如下请求方式，那么是不是就不会有跨域问题了
</p>
```html
<script type="text/javascript" src="www.somewhere.com/getdata"></script>
<!--需要这样一个script来发起get请求-->
```
<p>
	答案是肯定的，这也是jsonp跨域的原理。但是同时，这里也出现了两个问题，第一，怎么使用script来发送请求，第二，请求得到的数据应该怎么在前端页面上接收并处理。对于第一个问题，我们一般会将script标签写在html文档中，当我们通常遇到的都会是动态请求，如果有我们还像原来一样把标签提前写好在html中，那么浏览器解析文档到这个script标签时就会立即发起请求，等我们想要用到这些数据时，再去找前面加载好的数据，这样显然太费时费力，不太灵活，而且页面上如果有很多请求，岂不是要提前些很多script标签在页面上，这样页面丑陋的根本没法看了。我们需要的是在请求服务的时候，再发起请求，那么我们完全可以用动态标签来实现，通多document.createElement来动态创建一个script标签，然后为其设置src属性，等请求完毕之后再将script标签移除，那么第一个问题便迎刃而解了。
</p>
```js
let script = document.createElement('script');
srcipt.src = 'www.somewhere.com/getdata';
document.querySelector('head').appendChild(script);
```

<p>
	但同时，这也产生了第二个问题，我们怎么知道请求什么时候完毕，请求回来的数据要怎么处理,以及,请求完毕之后要怎么清除标签。前面说到过，script标签下载完毕之后会立即执行（async和defer暂时按下不表），而我们的请求通常会返回一个json对象，然而json直接执行是要报错的，如{"name": "柳轻侯", "job": "FE"}.如果花括号位于语句句首，那么花括号中的内容会被识别为一个语句块，外层的花括号会被直接忽略，如果是{name: '柳轻侯', job: 'FE'}这种形式可能并不会报错，因为即使忽略了花括号，name: '柳轻侯'也是一个合法的js语句，叫做标签语句，但是如有给标签语句加上引号，"name": "柳轻侯"，这种形式却并不合法，因为标签语句不可以用引号引起来，然而json的key却必须用双引号引起来，所以直接返回一个json是不行的，必须返回一个可执行的js语句才行。而且一般来说我们需要请求结果来执行一些js逻辑操作，那么我们的操作逻辑要写在哪里，怎么跟返回结果相结合呢？这时候就需要callback出场了。我们可以把请求结果"包装"一下,将数据的处理逻辑写到一个函数中，然后在script的结果中来调用这个函数，把需要的数据传给这个函数，那么一切问题就都可以解决了。假设请求结果内容是{"name": "柳轻侯", "job": "FE"},处理这个结果的函数叫callback
</p>

```js
// 结果的处理，callback函数，必须在script请求之前就已经在页面上声明或赋值
function callback (data) {
    console.log(data.name)
}


// 注意，script一定要返回一个js文件，文件内容是用回调函数将请求结果包装起来，形成函数调用的形式
// 文件内容
callback({"name": "柳轻侯", "job": "FE"})

```
<p>
	但是如果页面上有多jsonp请求，总不能所有的回调函数都叫callback吧，那么这时候就需要指定回调函数的名字，不同的jsonp请求调用不同的回调函数。可以通过script请求将函数名传到服务端，然后服务端相应的将结果用此函数名包装，然后返回到前端，这样就可以按名称调用了。我们将请求做以简单的封装。
</p>

```js
function getJSONP (url, callback) {
    let script = document.createElement('script');
    script.type= "type="text/javascript;
    srcipt.src = url + '?callback=' + callback;
    document.querySelector('head').appendChild(script);
}
```
<p>
	如果有这时候有两个请求需要处理，"www.somewhere.com/getdata1"和"www.somewhere.com/getdata2"两个请求需要处理，请求结果分别是{"name": "柳轻侯", "job": "FE"}和{"name": "天棠", "job": "fe"},处理函数分别是dealData1和dealData2,那我们该怎么处理？
</p>
```js
function getJSONP (url, callback) {
    let script = document.createElement('script');
    script.type= "type="text/javascript;
    srcipt.src = url + '?callback=' + callback;
    document.querySelector('head').appendChild(script);
}

const dealData1 = function (data) {
	console.log('这是getData1的回调:' + data.name);
}
const dealData2 = function (data) {
	console.log('这是getData1的回调:' + data.name);
}

// 分别发送请求
getJSONP('www.somewhere.com/getdata1', 'dealData1');  // www.somewhere.com/getdata1?callback=dealData1
getJSONP('www.somewhere.com/getdata2', 'dealData2');  // www.somewhere.com/getdata1?callback=dealData2

```
```js
// 请求结果分别是
dealData1({"name": "柳轻侯", "job": "FE"})
dealData2({"name": "天棠", "job": "fe"})

//执行结果
这是getData1的回调: 柳轻侯
这是getData2的回调: 天棠
```
<p>
	这时候两个结果会分别用传过去的callback来包装，然后输出不同的结果,这时候我们的需求基本上被满足了，最后还要处理的一点，每发一条请求，页面上被凭空创建了一个script标签，如果有请求很多，那么页面上就会多出很多无意义的标签（请求结束之后相应的标签就失去了意义），所以我们需要在请求处理结束之后清除创建的script标签。但是页面上还有别的script标签，必须只清除当前请求的jsonp生成的标签，如果将其他的script标签，可能就会造成其他的严重问题。由于每个jsonp的回调函数名称不一样，我们可以通过回调函数名来找出我们想要清除的script。
</p>

```js
const dealData1 = function (data) {
	console.log('这是getData1的回调:' + data.name);
	// 处理完毕之后清除相应的script标签
	let callbackName = arguments.callee.name;
	document.querySelector('script[src*="callback=' + callbackName + '"]').remove();
}
```


### 3. jsonp的缺点
* 只能发送get请求。因为script只能发送get请求
* 需要后台配合。此种请求方式应该前后端配合，将返回结果包装成callback(result)的形式。
