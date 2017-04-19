---
title: config-https-in-nginx
date: 2017-04-18 17:18:49
categories: nginx
tags: [nginx, https]
keywords: [nginx, https, nginx配置https]
---

### 1. 前言
<p>
    在chrome下使用google地图api的时候发现没有反应，不能获取用户的地理位置，查看控制台后发现必须要使用https请求，而我的nginx服务器配置为http请求，因此打算在nginx中配置https。配置步骤如下。
</p>

<!--more-->
<br>
***
<br>

### 2. 准备条件
#### 操作系统：windows 10
#### 服务器： Nginx
#### 安装Openssl
下载地址：[http://slproweb.com/products/Win32OpenSSL.html](http://slproweb.com/products/Win32OpenSSL.html) （根据系统选择32位或者64位版本下载安装）。下载完成后，进行安装，我安装在了E:\environment\OpenSSL-Win64文件夹中。
#### 配置环境变量
在环境变量中添加环境变量
    变量名： OPENSSL_HOME    <br>               变量值：E:\environment\OpenSSL-Win64\bin;（变量值为openssl安装位置）
    在path变量结尾添加如下 ： %OPENSSL_HOME%;
### 3. 配置步骤
 #### (1). 创建ssl目录
 首先在 nginx安装目录中创建ssl文件夹用于存放证书。比如我的文件目录为 C:\nginx\ssl,以_管理员_身份进入命令行模式，进入ssl文件夹。 命令为
 ```
    cd  c:/nginx/ssl
 ```

 #### (2). 创建私钥
 在命令行中执行命令：
 ```
 openssl genrsa -des3 -out server.key 1024 // （server文件名可以自定义）
 // 在此过程中需要你输入密码，并在此输入密码，请务必记住此密码，后面会用到
 ```
 #### (3). 创建csr证书
 在命令行中执行命令：
 ```
 openssl req -new -key server.key -out server.csr 
 // key文件为刚才生成的文件，server为自定义文件名
 ```
 
 执行上述命令后，需要输入信息。输入的信息中最重要的为 Common Name，这里输入的域名即为我们要使用https访问的域名。因为我是本地测试，因此我在此中配置为localhost.在执行完上述两个命令之后，ssl文件家中会出现两个文件`server.key`和`server.csr`

 #### (4). 去除密码
 在加载SSL支持的Nginx并使用上述私钥时可以去除口令，否则会在启动nginx的时候需要输入密码。<br>
 在命令行中执行命令：
 ```
 openssl rsa -in server.key -out server.key
 // 执行此命令需要输入刚才设置的密码
 ```

 #### (5). 生成crt证书
 在命令行中执行命令：
 ```
 openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt 
 // server为自定义文件名
 ```
 此条命令执行完之后ssl文件夹中应该多出了`server.crt`文件

### 4. 配置Nginx
上述步骤完成之后，我们需要的证书就已经生成了，现在只需要配置一下nginx就好了。nginx的配置文件位于 `nginx/conf/nginx.cof`
在http下新建一个如下的server
```
http {
    include       mime.types;
    default_type  application/octet-stream;

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    # 这是你新配置的https的server，可直接将一下内容复制到你的conf文件中
    server {
        listen       443 ssl;
        server_name    localhost;
        
        # 刚才生成的srt文件和key文件
        ssl_certificate      c:/nginx/ssl/server.crt;
        ssl_certificate_key  c:/nginx/ssl/server.key;

        # 下面一堆干嘛的我也不懂
        ssl_session_timeout  5m;
        ssl_protocols  SSLv2 SSLv3 TLSv1;
        ssl_ciphers  ALL:!ADH:!EXPORT56:RC4+RSA:+HIGH:+MEDIUM:+LOW:+SSLv2:+EXP;
        ssl_prefer_server_ciphers   on;

        location / {
            root   html;
            index  index.html index.htm;
        }
        error_page   500 502 503 504  /50x.html;
        
        location = /50x.html {
            root   html;
        }
    }

    # 这是你的其他server
    server {

    }

```
完成配置后_重启Nginx_，在浏览器地址栏输入`https://localhost`（https默认端口是443，因此这里可以省略），便可成功访问。

### 5. 结语
我们自己生成的证书是不受信任的，因此某些浏览器会弹窗警告证书不受信任，点击继续就行。当然这仅仅是我们为了开发测试自己生成的证书，如果是正式的生产环境，请从正规的CA中获取受信任的证书。