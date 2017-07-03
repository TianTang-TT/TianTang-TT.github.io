---
title: postMessage-in-html5
date: 2017-07-03 17:21:54
categories: [html5]
tags: [html5, postMessage]
keywords: [html页面通信, postMessage, postMessage页面通信, postMessage跨域]
---
### 1.前言
<p>
    跨域问题是前端开发中的常见问题，我们一般的解决方案无非是配置反向代理，jsonp或者cors，这些方案在前后端交互中比较有用，但是在某些场景下，这些手段就略显乏力。比如客户端页面之间的通信，子页面和父页面的通信，或者不同tab页面之间的通信，这时候由于浏览器同源策略的限制，会造成跨域问题，父子页面间无法进行通信，更不要提tab页签之前的通信。当然我们可以通过websocket这类的双工通信方式来解决，但是这需要经过服务端，而html5中postMessage的出现便可以很好地解决这种问题
</p>

<!-- more -->

### 2.简介
<p>
    window.postMessage() 方法可以安全地实现跨源通信。通常，当且仅当执行它们的页面位于具有相同的协议（通常为https），端口号（443为https的默认值），以及主机(模数 Document.domain 由两个页面设置为相同的值)。 window.postMessage() 方法提供了一种受控机制，以便在正确使用时以安全的方式规避此限制。
    window.postMessage() 方法被调用时，会在所有页面脚本执行完毕之后（e.g., 在该方法之后设置的事件、之前设置的timeout 事件,etc.）向目标窗口派发一个  MessageEvent 消息。 
</p>

### 3.基本语法
##### postMessage
> otherWindow.postMessage(message, targetOrigin, [transfer]);

##### otherWindow
> 其他窗口的一个引用，比如iframe的contentWindow属性、执行window.open返回的窗口对象、或者是命名过或数值索引的window.frames。

##### targetOrigin
> 通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串"\*"（表示无限制）或者一个URI。在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口；例如，当用postMessage传送密码时，这个参数就显得尤为重要，必须保证它的值与这条包含密码的信息的预期接受者的orign属性完全一致，来防止密码被恶意的第三方截获。__如果你明确的知道消息应该发送到哪个窗口，那么请始终提供一个有确切值的targetOrigin，而不是"\*"。不提供确切的目标将导致数据泄露到任何对数据感兴趣的恶意站点__。
