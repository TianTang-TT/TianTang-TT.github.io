---
title: postMessage实现页面间通信
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
    window.postMessage() 方法可以安全地实现跨源通信。通常，当且仅当两个页面具有相同的协议（通常为https），端口号（443为https的默认值），以及主机(模数 Document.domain 由两个页面设置为相同的值)才可以进行通信。 window.postMessage() 方法提供了一种受控机制，以便在正确使用时以安全的方式规避此限制。
    window.postMessage() 方法被调用时，会在所有页面脚本执行完毕之后（e.g., 在该方法之后设置的事件、之前设置的timeout 事件,etc.）向目标窗口派发一个  MessageEvent 消息。 
</p>

### 3.基本语法

##### postMessage
> otherWindow.postMessage(message, targetOrigin, [transfer]);

##### otherWindow
> 其他窗口的一个引用，比如iframe的contentWindow属性、执行window.open返回的窗口对象、或者是命名过或数值索引的window.frames。

##### targetOrigin
> 通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串"\*"（表示无限制）或者一个URI。在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口；例如，当用postMessage传送密码时，这个参数就显得尤为重要，必须保证它的值与这条包含密码的信息的预期接受者的orign属性完全一致，来防止密码被恶意的第三方截获。__如果你明确的知道消息应该发送到哪个窗口，那么请始终提供一个有确切值的targetOrigin，而不是"\*"。不提供确切的目标将导致数据泄露到任何对数据感兴趣的恶意站点__。

##### [transfer] 
> 是一串和message 同时传递的 [Transferable](https://developer.mozilla.org/zh-CN/docs/Web/API/Transferable) 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。
 
<p>
    当目标窗口接收到消息之后会触发一个message事件，将MessageEvent对象传进来，因此我们可以通过为目标窗口添加message事件来监听通信。而父页面上发过来的信息以及相应的事件属性
</p> 

### 4. 使用示例
<p>
    那么具体怎么使用呢？主要是通过`otherWindow.postMessage(message, targetOrigin)`来调用。比如我们要跟iframe内嵌的iframe通信，那么这个otherWindow就是这个iframe的window对象，我们可以通过`document.querySelector('#iframeid').contentWindow`来获取，然后通过postMessage方法来发送消息。而在iframe页面收到消息时，会触发一个message事件，接受一个messageEvent对象，从父页面上传进来的消息和相关事件的属性就挂载在这个messageEvent对象上。我们可以通过监听messge来接受父页面上传过来的消息
</p>

```js
window.addEventListener("message", event);
```

event 对象中主要包含以下属性。

##### data
> 从其他 window 中传递过来的对象，通过event.data获取。在 Gecko 6.0 (Firefox 6.0 / Thunderbird 6.0 / SeaMonkey 2.3)之前， 参数 message 必须是一个字符串。 从 Gecko 6.0 (Firefox 6.0 / Thunderbird 6.0 / SeaMonkey 2.3)开始，参数 message被使用结构化克隆算法进行序列化。__这意味着你可以将各种各样的数据对象安全地传递到目标窗口，对象或者数组，而不仅仅是可以发送字符串__。

##### origin
> 调用 postMessage 时消息发送方窗口的 origin ，通过event.origin获取。__此属性用来判断发送方的身份，防止恶意的第三方向页面发送恶意消息进行攻击__
.要注意的是，当你的页面使用非服务器环境（也就是直接双击打开页面）时这个属性值为null，在本地进行测试时请注意这一点，因为你可能拿不到origin的值。因此最好使用nginx或者Apache之类的web容器进行测试。
 
##### source
> 调用 postMessage 时消息发送方window对象的引用，可以借此实现两个页面之间的实时通信，通过event.source获取

##### 父页面代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>parent</title>
</head>
<body>
    <p>this is parent window</p>
    <input type="text" id="parentMsg">
    <button id="sendParentMsg">发送信息到iframe</button>
    <div class="contents">
        <p>这里会展示收到的信息</p>
    </div>
    <iframe src="demo.html" frameborder="2" id="childIframe" height="500" width="800"></iframe>
<script>
    var origin, win;
    // 为父页面绑定message事件，接受来自iframe发送的消息
    window.addEventListener('message', event => {
        document.querySelector('.contents').innerHTML += `<p> 收到信息：${event.data}, 来自于${event.origin}</p>`;
    });
    // win可以是iframe的引用，也可以是通过通过父页面打开的子页面的window引用，比如子页面是通过window.open打开的，那么win可以是win = window.open(url, '_blank'),这样便可以实现两个tab页之间的通信
    win = document.querySelector('#childIframe').contentWindow;
    document.querySelector('#sendParentMsg').addEventListener('click', () => {
        var parentMsg = document.querySelector('#parentMsg').value.trim();
        if (parentMsg) {
            win.postMessage(parentMsg, '*');
            document.querySelector('#parentMsg').value = '';
        }
    })
</script>
</body>
</html>
```

##### iframe页面代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>child</title>
</head>
<body>
    <p>this is iframe page</p>
    <label for="subpageInput"> 请输入信息</label>
    <input type="text" id="subpageInput">  
    <button class="sendSubpage">发送信息到父页面</button>
    <div class="contents">     
    </div>
<script>
    var parentWin, parentOrigin;
    // 监听来自父页面的消息
    window.addEventListener('message', event => {
        parentOrigin = event.origin; // 获取发送方页面的origin，通过判断此属性来识别发送方的身份
        parentWin = event.source; // 获取发送发window对象的引用，可以通过这个对象调用postMessage方法实现父子页面互相通信。
        document.querySelector('.contents').innerHTML += `<p>iframe 收到信息：${event.data}, 来自于${event.origin}</p>`;
    });
    document.querySelector('.sendSubpage').addEventListener('click', () => {
        var subMessage = document.querySelector('#subpageInput').value.trim();
        if (subMessage) {
            // submessage为要发送的信息，'*'为指定某个域接受信息
            parentWin.postMessage(subMessage, '*')
            document.querySelector('#subpageInput').value = '';
        }
    })
</script>
</body>
</html>
```

![](http://7xt6mo.com1.z0.glb.clouddn.com/postMessage.png)
### 5. 使用场景
##### (1) 页面之间的通信
<p>
    当你使用多页应用时，需要两个页面之间进行实时的通信，而又不想通过服务端进行websocket之类借助服务端实现的通信，那postMessage将是一个很好的方式。子页面可以通过window.open方法打开，var win = window.open(pageurl, '_blank');那么这个win就是新打开的tab窗口的引用，可以同win.postMessage方法来对新打开的tab页发送消息。当你在新打开的页面监听message事件，便可以从message事件对象中得到原页面发送的消息，同时可以得到原页面的window对象的引用source，这时候就可以在新的页面上利用这个source调用postMessage方法来对原页面发消息。这样就实现了两个页面的实时通信。
</p>

##### (2) 通过iframe授权登录
<p>
    当公司有多个网站或者多款产品，而这些网站的账号密码是可以通用的，比如我注册了我司的网站a，那么我再登录我司的网站b的时候就可以通过网站a的用户名和密码来登录网站b，类似于令牌一样的，那么你只需要做一套登录页面就可以。实现的原理很简单，比如我们需要在index.html页面上需要进行某个操作，而这个操作需要用户登录之后才可以进行，那我们便可以通过引入一个iframe，或者打开一个新的tab页面来让用户进行登录(这个iframe页或者新的tab页就是我们需要的登录页)，然后在index上监听message事件，当登录成功或者失败之后，通过postMessage将登录结果发送回index页面，这样父页面便可以通过这个登录结果进行后续的操作。
</p>

### 6. 安全隐患
<p>
页面监听到message事件之后必须对源页面合法性进行校验，也就是说你必须校验event.origin属性，确保这个消息是可信页面发送过来的，否则如果是恶意的第三方网站发送的恶意代码，那么可能造成一些严重的后果。例如你的站点监听着一个message，并且没有判断message的来源，导致可以给他发message，message中有websocket的url的话，站点会和发送message的站点建立websocket链接，并且会把认证后的token传递给发送者站点。再比如你是需要将event.data的值进行dom操作，如果恶意的第三方将xss攻击代码加入data，那么如果你不校验消息来源的合法性的话，就很可能造成xss攻击。__如果您不希望从其他网站接收message，请不要为message事件添加任何事件侦听器,否则，请始终使用origin和source属性验证发件人的身份。__
</p>

```js
// 校验origin合法性的方法,如果只想接受来自'https://verify.com'的消息
window.addEventListener('message', event => {
    var origin = event.origin;
    if (/^https:\/\/verify.com$/.test(origin)) {
        // 此处进行敏感操作
    } else {
        // 当校验不通过，则什么也不做，丢弃此消息
    }
})
```

### 7. 浏览器兼容情况

![](http://7xt6mo.com1.z0.glb.clouddn.com/postMessage-caniuse.png)
