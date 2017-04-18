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
 首先在 nginx安装目录中创建ssl文件夹用于存放证书。比如我的文件目录为 C:\nginx\ssl,以管理员身份进入命令行模式，进入ssl文件夹。 命令为`cd  c:/wnmp/nginx/ssl`
 #### (2). 创建私钥
 在命令行中执行命令： `openssl genrsa -des3 -out server.key 1024` （server文件名可以自定义）
 #### (3). 创建csr证书
 在命令行中执行命令：  `openssl req -new -key server.key -out server.csr`    （key文件为刚才生成的文件，server为自定义文件名）
  执行上述命令后，需要输入信息。输入的信息中最重要的为 Common Name，这里输入的域名即为我们要使用https访问的域名。因为我是本地测试，因此我在此中配置为localhost