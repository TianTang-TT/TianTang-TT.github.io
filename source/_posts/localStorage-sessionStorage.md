---
title: '浏览器本地存储,localStorage,sessionStorage'
date: 2016-04-07 19:39:46
categories: javascript
tags: [localStorage,sessionStorage,webStorage,浏览器本地存储]
---

### 1.前言

一般来说，当我们首次登陆某个网站的时候，浏览器会默认提供一个“记住密码”的功能来询问你是否需要浏览器来记住你的登陆密码，这些密码会以加密的形式安全的存放在你的本地磁盘上。但是我们需要的往往并不仅仅是记住密码而已，有时候我们希望存储更多的信息在本地。浏览器tab页中的信息通常会在关闭标签页的时候销毁，只有那些保存在cookie的信息会被写入到磁盘中，所以当你再次打开浏览器的时候，除了cookie中的信息，你上次访问网页的信息将会全部丢失，因此我们不得不一次次的输入那些重复的信息，白白浪费自己的时间，而现在，html5提供的本地存储功能webStorage可以帮我们完美的解决这个问题。

<!--more-->

***
<br>


### 2.webStorage

以往我们用cookie来将需要的信息保存到本地，下次需要这些信息的时候直接从cookie中获取就可以了，这种便捷的方式一直以来是web开发人员本地存储的主要方式，但这种方式也有自己的弊端，比如cookie大小有限制，相当轻量，因此能存放的信息量不大，而且每发请求都会带上相应的cookie，如果cookie中包含敏感信息，那么这种行为就相当危险了。web Storage主要有以下两个目标

* 提供一种cookie之外存储的会话的途径.
* 提供一种可以存储大量可以跨会话存储的机制

支持webStorage的浏览器的window上定义了两个属性，localStorage和sessionStorage,这两个属性都是storage对象的实例，下面是storage接口的定义

```c++
interface Storage {
  readonly attribute unsigned long length;
  DOMString? key(unsigned long index);
  getter DOMString? getItem(DOMString key);
  setter void setItem(DOMString key, DOMString value);
  deleter void removeItem(DOMString key);
  void clear();
};

```

所以localStorage和sessionStorage也拥有setItem,getItem,removeItem等方法，下面分别来讲这两种存储方法各有什么特点。ps:下文中的webStorage对象指的是localStorage或sessionStorage

***
<br>

### 3.localStorage和webStorage

由于webStorage中信息的存储（目前）只能存储字符串，所以如果存储别的类型的数据，会被浏览器默认转为字符串存储起来。

```javascript
//api


//若key不存在，则创建该key,并把相应的值设为value，
//若key已经存在，则判断当前value和原始值oldvalue是否相等，若相等，则do nogthing，什么也不做(__注意:此种情况不会触发事件)
//若key存在且value!=oldvalue,则用value覆盖oldValue;
setItem(key,value):存储一条记录

//若key不存在，则do nothing，什么也不做(__注意:此种情况不会触发事件)
//若key存在，则返回该key相对应的value
getItem(key):获取一条记录

//若key不存在，则do nothing，什么也不做(__注意:此种情况不会触发事件)
//若key存在，则清除对应的记录
removeItem(key):清除一条记录

clear():清除当前webStorage对象的所有键值对

//若n>length,则返回null
key(n):获取第n条记录的key

//获取当前webStorage对象的记录条数
length:总数属性

```

这里要注意的一点是可以通过设置属性来存储一条记录，通过查询该属性来获取该记录，通过delete操作符来删除该记录(非ie8及以下)

```javascript
	var ls = localStorage;
	ls.setItem("name","honor")        //等价于ls.name = "honor"
	ls.setItem("name","柳轻侯")       //直接覆盖原来的oldvalue,相当于ls.name = "柳轻侯"
	ls.removeItem("name")             //等价于delete(ls.name),此举仅在非ie8下生效
```
***
<br>

### 4.生命周期和作用域

如我们所知，cookie可以设置domain和cookie,那么localStorage和sessionStorage是否也有作用域和生命周期呢，答案是显然的，并且不同的作用域和生命周期是localStorage和sessionStorage的主要区别。和cooie不同，ls(localStorage)和ss(sessionStorage)有默认的作用域和生命周期，ls存储的数据是永久性的(存储在用户的磁盘上)，除非用户可以得去清除存储的数据，否则将一直存在下去，不会过期。

可读取共同ls的文档应该是同源的(同协议，同域，同端口)，通源文档分享同一个ls对象，可以相互读取或覆盖对方的数据，两个不同窗口tab页之间可以相互通信，没有类似于cookie的path限制，或者你可以把ls的path当成'/'。但有一点需要注意，虽然同源文档共同维护同一个ls对象，且这个ls对象是存储在用户的磁盘上的，但是 不同的浏览器却又有相对独立的作用域，比如你使用chrome为www.test.com设置了一个ls对象，你用FireFox访问www.text.com却访问不到上次在chrome中设置的ls对象，别的浏览器也一样。

ss对象的生命周期一般是当前window对象的生命周期，也就是说除非当前tab页关闭，否则这个ss对象是一直存在的，当然前提是你刷新的tab页跟之前的页面是同源的(同协议，同域，同端口)。但是不同的window之间是不可以共享同一个ss，即使两个window的url是一模一样的，也就是说，不同的tab页之间的信息共享是被严格限制的，no way!.

***
<br>

### 5.存储事件

只要ls或ss的数据对象发生改变，浏览器在其他对该数据可见的窗口对象上会触发存储事件（在对数据进行改变的窗口上反而不会触发，也就是说同源的a页面和b页面，如果a页面中对ls对象做出修改，那么会在b页面上触发存储事件，而a页面上却不会触发。（__注意： 只有数据真正发生改变时才会触发存储事件，do nothing的情况是不会触发事件的）。 我们可以通过dom2的事件监听方法addEventListere方法监听storage事件

```javascript
	//与storage事件相关的五个属性（ie8不支持）
	key: 被设置或移除的键名字，如果为clear事件，则该属性为null
	newVlaue：被设置项的新值，如果书removeItem事件，则该属性为null
	oldValue: 被设置或移除的项的原始值，若该项是新增项，则该属性是null
	storageArea: 目标window对象上的localStorage属性或sessionStorage属性
	url: 触发该事件的文档的url
```
***
<br>

### 6.浏览器支持

![](http://7xt6mo.com1.z0.glb.clouddn.com/heavenimUfMv.jpg)

chrome和safri的ss和ls大小限制为2.5Mb,其他浏览器为5Mb,这个容量足以应对大部分需求。要特别注意，ie8不支持delete操作符，为保证兼容性，应该尽量使用stemItem,getItem，removeItem

***
<br>



### 7.总结
总体来说html5的本都存储还是很强大的，可以我们大部分需求，但并非所有浏览器都实现了这个接口，所以在使用之前最好先检测一下看浏览器是否支持ls和ss。另外，目前ls和ss都只能存储字符串，如果想要存储一些复杂的接口，可将其先转化为字符串然后存储，用的时候再将格式还原。

