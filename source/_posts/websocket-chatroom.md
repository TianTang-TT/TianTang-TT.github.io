---
title: websocket-chatroom
date: 2017-01-09 19:02:21
categories: nodejs
tags: [nodejs, javascript, websocket, socket.io]
keywords: [nodejs+websocket, 聊天室, 在线聊天室, socketio聊天室]
---

### 1. 前言
<p>
	随着浏览器怼html5的支持，我们现在可以用前端做一些很有意思的事情，比如在线聊天室，今天就谈谈怎么用nodejs+websocket实现一个简单的在线聊天室。本文用socket.io打造一个在线聊天室，取名为uchat，‘有聊’或者叫‘友聊‘。
</p>

<!-- more -->

### 2.主要技术和模块

##### 前端
* socket.io  封装了websocket，提供了友好的api，使用方便
* template-native.js art-template模板引擎

##### 后台
* nodejs     v6.9.1，基本支持了es6语法
* express    静态资源服务器
* socket.io  websocket库，后台也得支持websocket不是吗

##### 思路
> 主要模拟微信网页端的交互和UI，通过socket.io来发送和接受消息，支持emoji表情和图片的发送。发送图片主要是利用了html5的FileReader，然后发送dataurl，这样只需要将img标签的src设置为base64的url就可以正常显示图片了。至于emoji的发送，因为每个客户端的emojis都是一样的，所以emoji本身并不会经过socket来传输，传输的仅仅是一个特定的emoji编码，这样前端接收到这个编码之后就可以正常显示相应的emoji了。

### 3. 主要代码
<p>
	前端html代码具体就不展示了，感兴趣的可以查看 [uchat](https://github.com/Back0/UChat);主要讲解一下node端的实现和前端的思路。服务端主要用了socket.io，这个前面已经说过了，既然是聊天室，那肯定就需要展示在线人员列表以及在线人数，因此我用了es6的Map对象存储当前在线人员，因为可以它方便的进行增删改查，如果有用数组来实现的话要相对麻烦很多。在建立连接对象的时候创建一个Map对象map，利用socket对象的id来作为连接用户的唯一表示，也把它作为用户在map对象中的唯一key（map中的key不允许重复）。然后通过socket来监听一个自定义login事件，当用户在前端发触发login的时候，后端将当前连接的socketId作为key，然后创建一个对象存储用户数据，包括用户名以及一些其他用户数据，然后将这个key和对象存储到map中，作为在线人员。当某个用户在前端发送了消息之后
</p>
```js

```