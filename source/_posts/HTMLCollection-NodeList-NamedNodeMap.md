---
title: HTMLCollection和NodeList以及NamedNodeMap之间的关系
date: 2016-06-27 20:10:11
categories: javascript
tags: [HTML, javascript]
keywords: [HTMLCollection, NodeList, NamedNodeMap, HTMLCollection和NodeList的区别, 
            HTMLCollection和NodeList的不同, HTMLCollection&NodeList和NamedNodeMap, NamedNodeMap是什么]
---

### 1.前言

之所以把这三者放到一起，是因为这三个对象都是"Array-like"的（类数组）,它们具有像数组一样的特性，比如具有length属性，都可以通过索引[index]来获取相应的元素。更为重要的是，它们都是'live'的，是'有生命有呼吸的对象'，这么说是因为这三者都是动态的，会实时更新查询dom结构。

<!--more-->

***

### 2.背景
```html
<!--有如下dom结构-->
<div id="t1" class="active">
	<div id="tt1"></div>
	<div id="tt2"></div>
	<div id="tt3"></div>
</div>
```
```javascript
var nodelist = document.getElementById('t1').childNodes;
var htmlcollections = document.getElementsByTagName('div');
var attrs = document.getElementById('t1').attributes;

nodelist instanceof NodeList                 //true
htmlcollections instanceof HTMLCollection    //true
attrs instanceof NamedNodeMap                //true
```

由上面可以看出，通过getElemetnsByTagName获取的是一个HTMLCollection,从方法名来看，getElementsByTagName是通过标签名获取到的一个元素的集合，是elements(元素)的集合，虽然说这些元素中可能包含其它非element节点，比如text节点，但是这些节点是附属于某个element的，并不是通过tagName来获取到的。element.childNodes获取到的是一个NodeList，是Node(节点)的 集合，可能同时包括element节点其他节点，例如上面代码中的nodelist就有7个节点，其中3个element，4个text节点(在ie9及以下的浏览器中空白符不算入文本节点)。element.attributes获取的则是一个特性Attribute集合，而集合中的每一个元素，都是Attr类型的对象。Attr对象有三个属性，name、value和specified。但是在日常应用中，一般会应用getAttribute()、setAttribute()和romoveAttribute()来操作特性，不需要直接访问特性对象。


### 3.定义

```javascript
interface HTMLCollection {
  readonly attribute unsigned long   length;
  Node               item(in unsigned long index);
  Node               namedItem(in DOMString name);
};

interface NodeList {
  Node               item(in unsigned long index);
  readonly attribute unsigned long   length;
};

interface NamedNodeMap {
  Node               getNamedItem(in DOMString name);
  Node               setNamedItem(in Node arg)
                                        raises(DOMException);
  Node               removeNamedItem(in DOMString name)
                                        raises(DOMException);
  Node               item(in unsigned long index);
  readonly attribute unsigned long    length;
  // Introduced in DOM Level 2:
  Node               getNamedItemNS(in DOMString namespaceURI, 
                                    in DOMString localName);
  // Introduced in DOM Level 2:
  Node               setNamedItemNS(in Node arg)
                                        raises(DOMException);
  // Introduced in DOM Level 2:
  Node               removeNamedItemNS(in DOMString namespaceURI, 
                                       in DOMString localName)
                                        raises(DOMException);
};
```

由上面接口定义可以看出， 这三种对象都可以通过[index]来便利查找，都可以通过item(index)方法来查询对应的值，但是HTMLCollection实例比NodeList实例和NamedNodeMap实例多了namedItem方法	，NamedNodeMap的实例则是有更多的取值设值得api,但在开发中我们一般用getAttribute()、setAttribute()和romoveAttribute()来操作特性，不需要直接访问特性对象。对类数组而言，我们可以把它们转成真正的数组，以便使用以下数组的特有方法。

```javascript
var divs = document.getElementsByTagName("div");
	divs instanceof Array;               //false
var divArray = Array.prototype.slice.call(divs);
	divArray instanceof Array;           //true
	divArray.forEach(function(item,index){
		//do something
	})
```

### 4.注意

```javascript
 var divs = document.getElementsByTagName("div"),
        i,
        div;
    for (i = 0; i < divs.length; i++) {
        div = document.createElement("div");
        document.body.appendChild(div);
    }

```

以上代码是无限循环，HTMLCollection、NodeList以及NamedNodeMap这三个集合都是“动态的”，每当文档发生变化时，他们都会更新。他们将始终保持这最新、最准确的消息。我们知道dom操作是很"昂贵"的，频繁的进行dom操作会造成性能的极大损耗，在上面的for循环中，每循环一次都要查一遍dom结构来获取最新的信息，如果dom结构很复杂嵌套很深，那么这种查找的性能损耗就可想而知了。因此我们可以把查询结果缓存到一个变量中就可以避免每次都查找的窘境了。

```javascript
var divs = document.getElementsByTagName("div"),
        i,
        len,   //len用来缓存divs的长度，创建一个number副本，避免每次都查找
        div;
    for (i = 0, len = divs.length; i < len; i++) {  
        div = document.createElement("div");
        document.body.appendChild(div);
    }

```

值得一提的是querySelectorAll()也将会返回一个NodeList(如果存在)，但是这时候的NodeList却并不是动态的，而是类似于一个快照一样，并不会实时查询，因为这个NodeList是一个<b>StaticNodeList</b> 

### 5.总结

1.理解HTMLCollection，NodeList以及NamedNodeMap各自代表了，有哪些共性。
2.它们都是类数组，有length属性，[index]取值方法。
3.他们都是动态的，必要的时候要缓存起来。
4.querySelectorAll()返回一个静态StaticNodeList。

### 6.参考资料

1. [js便签笔记（1）——说说HTMLCollection、NodeList以及NamedNodeMap](http://www.cnblogs.com/wangfupeng1988/p/3626300.html)
1. [Document Object Model Core](https://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177)
1. [Document Object Model HTML](https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-75708506)