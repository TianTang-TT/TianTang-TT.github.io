---
title: websocket实现聊天室功能，仿微信pc端
date: 2017-01-09 19:02:21
categories: nodejs
tags: [nodejs, javascript, websocket, socket.io]
keywords: [nodejs+websocket, 聊天室, 在线聊天室, socketio聊天室]
---

### 1. 前言
<p>
	随着浏览器对html5的支持，我们现在可以用前端做一些很有意思的事情，比如在线聊天室，今天就谈谈怎么用nodejs+websocket实现一个简单的在线聊天室。本文用socket.io打造一个在线聊天室，取名为uchat，‘有聊’或者叫‘友聊‘。
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
	前端html代码具体就不展示了，感兴趣的可以查看 [uchat](https://github.com/Back0/UChat);主要讲解一下node端的实现和前端的思路。服务端主要用了socket.io，这个前面已经说过了，既然是聊天室，那肯定就需要展示在线人员列表以及在线人数，因此我用了es6的Map对象存储当前在线人员，因为可以它方便的进行增删改查，如果有用数组来实现的话要相对麻烦很多。在建立连接对象的时候创建一个Map对象map，利用socket对象的id来作为连接用户的唯一表示，也把它作为用户在map对象中的唯一key（map中的key不允许重复）。然后通过socket来监听一个自定义login事件，当用户在前端发触发login的时候，后端将当前连接的socketId作为key，然后创建一个对象存储用户数据，包括用户名以及一些其他用户数据，然后将这个key和对象存储到map中，同时将用户登录的消息广播到其他的客户端。当某个用户在前端发送了消息之后，服务端接受消息，并把它转发到除了发送者之外的所有客户端中。图片和表情的发送也是类似的思路。当某个客户端断开连接之后，服务端监听到disconnet时间，然后将该用户从map对象中移除，然后将消息广播给其他客户端。
</p>
```js
const users = new Map();
const socketIO = io => {
  // 当用户在客户端发送websocket请求和服务端建立socket连接之后会触发服务端的connection事件
  io.on('connection', socket => {
    // 每个客户端都有一个连接对象，其中id属性为唯一标识
    let userId = socket.id;
    
    // 监听登陆事件，用户登陆之后将用户信息存储于map对象中
    socket.on('login', name => {
      let headline = '';
      if (!isLogin(userId)) {
        users.set(userId, {name, headline});

        let msg = `${name} joined`;
        // 通知其他用户有人加入群聊
        io.sockets.emit('message', {type: 'system', data: msg});
        io.sockets.emit('membersChange', userArr());
      }      
    });

    // 接受消息事件
    socket.on('message', msg => {
      if (isLogin(userId)) {
        socket.broadcast.emit('message', msg);
      }     
    })
    // 从在线列表中删除断连用户
    socket.on('disconnect', () => {
      let user = users.get(userId);
      let msg = `${user.name} left`;
      users.delete(userId);
      socket.broadcast.emit('membersChange', userArr());
      socket.broadcast.emit('message', {type: 'system', data: msg});
    });
    // 判断用户是否已登陆
    function isLogin (id) {
      if (users.has(id)) {
        return true;
      }
      return false;
    }
    function userArr() {
      let values = users.values();
      return [...values]
    }
  });
}
```
<p>
  以上是服务端的主要逻辑，清晰明了，代码也不多，那么在客户端呢。首先我们引入了socket.io的库（前后端都用了socket.io，只不过前端是客户端的socket.io），写了一个登陆界面，需要填入用户昵称，毕竟你需要知道消息是谁发来的。填入昵称，点击登陆之后才会建立socket连接，因为这时候才能算你登陆成功，否则将不会在后端的map对象中存储用户信息。登陆之后就进入了群聊界面，主要三部分，用户列表，对话区，输入区。建立了一个全局的uchat对象来保存一个客户端实例，构造这个对象的同时绑定了登陆逻辑，当用户成功登陆之后就可以进行这个实例的初始化了。实例的初始化主要包括以下的部分，获取当前在线的用户列表，绑定一些页面的事件，比如发送消息，发送图片，选择表情。当用户点击表情按钮的时候进行表情的下载（不放在初始化中是为了提高首页加载速度），然后展示表情面板。
</p>
<p>
  写输入区的时候遇到一个问题，我之前使用textarea来做的输入区，用来发送文本消息，传送图片也没有问题因为图片不会在输入区显示，而是选择好之后就直接发送了，没有后悔药。但是发表情的时候不能这样搞啊，先得在输入区显示，然后万一点错了还可以删除或者更换，然后可以图文一起发送。但是textaera中是不能显示图片表情的，这个问题有点蛋疼，想了很久也没有想到合适的解决方案，于是查看了网页微信，发现是用的p标签来做的输入区，然后设置contenteditable为true，真一语惊醒梦中人，图片在p标签中可以显示啊，于是我将输入区修改为了p标签，这样就可以愉快的选择输入表情了。但是还有个问题，那就是每个客户端要选的表情都是那么些，每个表情在客户端都有（你要发表情肯定得提前在客户端下载好）,每次都通过socket直接传输表情数据岂不是显得很浪费，白下那么多表情了？那么既然每个用户的可选择表情都是一样的，而且客户端本地下好了这些表情，如果我知道别的客户端发来的是什么表情，直接显示我本地的表情不就好了？恩，看起来没毛病，那么我怎么知道对方发来的是什么表情呢？？？在这里，我对每个表情都制定了一个编号，构建了一定的规则，表情的类型编号都是[emoji:type_number]的形式，type是表情类型，number是具体的表情编号，跟表情图片的文件名保持一致，这样就能直接通过编号来找到指定的表情了。所以表情面板中的img标签都会有data-type和data-num两个属性。当用户选择某个表情之后，js会复制这个表情的img标签，然后显示在下方的输入区中，这样就能在输入区中显示图片了。点击发送键的时候先对输入区内容做过滤，把img标签换成[emoji:type_number]的形式发送，当别的客户端收到一段文本消息之后也做过滤，把其中的[emoji:type_number]换成相应的img标签，这样就能在对话区显示相应的图片了。
</p>

```js
var uchat = null;
window.onload = function () {
  uchat = new UChat();
  uchat.login();  
}

function UChat () {
  this.socket = null;
  this.emojiLoaded = false;
}

UChat.prototype = {
  login: function () {
    var self = this;
    var loginPage = document.querySelector('#login');
    var userInput = loginPage.querySelector('.username');
    var loginBtn = loginPage.querySelector('.btn-login');
    loginBtn.addEventListener('click', join);
    userInput.addEventListener('keydown', function (e) {
      if (e.keyCode === 13 || e.code.toLowerCase() === 'enter') {
        join();
      }
    });
    function join () {
      var username = userInput.value;
      if (!username.trim().length) {
        alert('请输入昵称');
        return;
      }      
      userInput.value = '';
      loginPage.style.display = 'none';
      self.name = username;
      self.init();
    }
  },
  init: function () {
    var self = this;
    // 显示左侧用户资料
    this.displayProgile();
    // 链接到服务器
    this.socket = io.connect();
    // 建立连接
    this.socket.on('connect', function () {
      // 此处需要展示登陆界面
      self.socket.emit('login', self.name);
    });
    this.socket.on('message', function (msg) {
      self.addDialogItem(msg);
    });
    // 当前群聊人员变动
    this.socket.on('membersChange', function (memberArr) {
      // 更新在线人员列表
      self.upDateMemItem(memberArr);
    });
    this.bindEvent();
  },
  displayProgile: function () {
    var self = this;
    var profile = document.querySelector('#members .profile');
    profile.querySelector('.nick-name').innerText = self.name;
  },
  /**
   * [bindEvent 绑定事件入口]
   * @return {[undefined]} 
   */
  bindEvent: function () {
    // 发送消息
    this.bindSendMsg();
    // 发送表情
    this.bindSendEmoji();
    // 发送图片
    this.bindSendImg();

  },
  /**
   * [bindSendMsg 发送信息]
   * @return {[type]} [description]
   */
  addDialogItem: function (data) {
    // 接收到后台发来的信息然后在对话区展现出来
    // {type: 信息类型, data: 具体的信息}
    var html = template('msgTpl', data);
    // 过滤，将表情代码换成图片
    html = this.codeToImg(html);
    var dialogArea = document.querySelector('#chatting .dialogs');
    dialogArea.innerHTML += html;
    // 消息更新后滚动条滚到底
    dialogArea.scrollTop = dialogArea.scrollHeight;
  },
  /**
   * [upDateMemItem 更新在线人员列表]
   * @param  {[type]} memberArr [description]
   * @return {[type]}           [description]
   */
  upDateMemItem: function(memberArr){
    var memHtml = template('memTpl', {memberArr: memberArr});
    var memList = document.querySelector('.mems-list');
    memList.innerHTML = memHtml;
    document.querySelector('#dialog .count').innerText = memberArr.length;
  },
  bindSendMsg: function () {
    var self = this;
    var speakArea = document.querySelector('#typing #typeContent');
    var sendBtn = document.querySelector('#typing .btn-send');
    // 点击按钮发送
    sendBtn.addEventListener('click', sendMsg);
    // 回车发送
    speakArea.addEventListener('keydown', function (e) {
      if (e.keyCode === 13 || e.code.toLowerCase() === 'enter') {
        sendMsg(e);
      }
    });
    function sendMsg (e) {
      var speaking = speakArea.innerHTML;
      speaking = self.imgToCode(speaking);
      if (speaking.trim().length) {
        self.socket.send({msgType: 'text', data: speaking, username: self.name});
        // 把信息显示在对话区域
        self.addDialogItem({type: 'self', data: speaking, username: self.name});
        // 清空输入区
        speakArea.innerHTML = '';
        e.preventDefault();//这句话可以阻止回车事件冒泡;如果注释掉这句话,那么会有空格残余;
      }
    }
  },
  bindSendImg: function () {
    var self = this;
    var file = null;
    var reader = null;
    var fileName = '';
    var imgReg = /\.(jpg|jpeg|png|gif)$/;
    var imgInput = document.querySelector('#typing .uploadImg');
    imgInput.addEventListener('change', function () {
      if (!this.files.length) {
        return;
      }
      file = this.files[0];
      fileName = file.name;
      if (!imgReg.test(fileName.toLowerCase())) {
        alert('请选择一张图片');
        imgInput.value = '';
        return;
      }
      reader = new FileReader();
      // 图片读取完毕之后马上显示
      reader.onload = function (e) {
        self.addDialogItem({type: 'self', data: e.target.result, msgType: 'img', username: self.name});
        self.socket.send({type: 'dialog', msgType: 'img', data: e.target.result, username: self.name});
        imgInput.value = '';
      }
      reader.readAsDataURL(file);
    })
  },
  
  bindSendEmoji: function () {
    var self = this;
    var emojiTool = document.querySelector('#typing .tools .emoji');
    var container = emojiTool.querySelector('.emoji-container');
    var emojiSelector = container.querySelector('.selector');
    var emojiTab = container.querySelector('.tab');
    var img, qqFragment, tsjFragment;
    emojiTool.addEventListener('click', function (e) {
      var qqSection = container.querySelector('section[data-type=qq]');
      var tsjSection = container.querySelector('section[data-type=tsj]');
      if (container.clientHeight > 10) {
        container.style.display = 'none';
      } else {
        container.style.display = 'block';
      }
      // 下载表情
      if (!self.emojiLoaded) {
        qqFragment = document.createDocumentFragment();
        tsjFragment = document.createDocumentFragment();
        // qq表情75个
        for (var i = 1; i <= 75; i++) {
          img = document.createElement('img');
          img.setAttribute('data-type', 'qq');
          img.setAttribute('data-num', i);
          img.src = 'assets/imgs/qq/' + i + '.gif';
          qqFragment.appendChild(img);
        }
        qqSection.appendChild(qqFragment);
        // 兔斯基表情18个
        for (var j = 1; j <= 69; j++) {
          img = document.createElement('img');
          img.setAttribute('data-type', 'tsj');
          img.setAttribute('data-num', j);
          img.src = 'assets/imgs/tsj/' + j + '.gif';
          tsjFragment.appendChild(img);
        }
        tsjSection.appendChild(tsjFragment);
        self.emojiLoaded = true;
      }
      e.stopPropagation();
    });
    // 选择表情类型
    emojiSelector.addEventListener('click', function (e) { 
      var target = e.target.parentNode;
      var type = target.getAttribute('data-type');
      if (!type) {
        return;
      }
      var sections = container.querySelectorAll('.emoji-list');
      [].slice.call(sections).forEach(function (item) {
        var itemType = item.getAttribute('data-type');
        if (itemType === type) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
      e.stopPropagation();

    });
    // 选择表情
    emojiTab.addEventListener('click', function (e) {
      var target = e.target;
      var type = target.parentNode.getAttribute('data-type');
      var num = target.getAttribute('data-num');
      if (!type || !num) return;
      var speakArea = document.querySelector('#typing #typeContent');
      speakArea.innerHTML += target.outerHTML;
      container.style.display = 'none';
      e.stopPropagation();
    })
    // 点击空白处隐藏表情面板
    document.addEventListener('click', function () {
      container.style.display = 'none';
    });
  },
  imgToCode: function (str) {
    var emojiReg = /<img.+?data-type="(\w+)".+?data-num="(\d+)".*?>/g;
    return str.replace(emojiReg, '[emoji:$1_$2]');
  },
  codeToImg: function (str) {
    var codeReg = /\[emoji:(\w+?)_(\d+?)\]/g;
    return str.replace(codeReg, '<img src="assets/imgs/$1/$2.gif">');
  }
}
```

### 4. 总结
<p>
  也没什么好说的，写这种长文总是缺乏耐心。
</p>

### 5. 参考

[Node.js + Web Socket 打造即时聊天程序嗨聊](http://www.cnblogs.com/Wayou/p/hichat_built_with_nodejs_socket.html);