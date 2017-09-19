---
title: 前端开发规范
date: 2016-06-08 14:34:36
categories: javascript
tags: 开发
keywords: [javascript,开发规范, 前端开发规范]
---

### 前言

软件bug的修复是昂贵的，并且随着时间的推移，这些bug的成本也会增加，尤其当这些bug潜伏并慢慢出现在已经发布的软件中时。当你发现bug的时候就立即修复它是最好的，此时你代码要解决的问题在你脑中还是很清晰的。否则，你转移到其他任务，忘了那个特定的代码，一段时间后再去查看这些代码就需要，此摘要也包括一些与代码不太相关的习惯，但对整体代码的创建息息相关，包括撰写API文档、执行同行评审。这些习惯和最佳做法可以帮助你写出更好的，更易于理解和维护的代码。


<!--more-->

***
<br>


### 全局变量的问题

全局变量的问题在于，你的JavaScript应用程序和web页面上的所有代码都共享了这些全局变量，他们住在同一个全局命名空间，所以当程序的两个不同部分定义同名但不同作用的全局变量的时候，命名冲突在所难免。

由于JavaScript的两个特征，不自觉地创建出全局变量是出乎意料的容易。首先，你可以甚至不需要声明就可以使用变量；第二，JavaScript有隐含的全局概念，意味着你不声明的任何变量都会成为一个全局对象属性。参考下面的代码：


```javascript
// 不推荐写法: 隐式全局变量 
function sum(x, y) { 
   result = x + y; 
   return result;
}

//推荐写法，始终使用var声明变量
function sum(x, y) {
   var result = x + y;
   return result;
}


```


另一个创建隐式全局变量的反例就是使用任务链进行部分var声明。


```javascript
var a = b = 0;      //a是局部变量但是b却隐式的创建了全局变量
                    //另外，变量是不可通过delete操作符删除的
```

### 访问全局变量

在浏览器中，全局对象可以通过window属性在代码的任何位置访问（除非你做了些比较出格的事情，像是声明了一个名为window的局部变量）。但是在其他环境下，这个方便的属性可能被叫做其他什么东西（甚至在程序中不可用）。如果你需要在没有硬编码的window标识符下访问全局对象，你可以在任何层级的函数作用域中做如下操作：


```javascript
var global = (function () {
   return this;
}());
//严格模式下不可用
```

### 单var形式

在函数顶部使用单var语句来声明变量，将此作用域中可能用到的变量事先声明，防止变量在定义之前使用的逻辑错误和重复声明。你也可以在声明的时候做一些实际的工作，例如前面代码中的sum = a + b这个情况，另外一个例子就是当你使用DOM（文档对象模型）引用时，你可以使用单一的var把DOM引用一起指定为局部变量，就如下面代码所示的：


```javascript
function func() {
   //将此作用域中要用到的变量提前声明
   var a = 1,
       b = 2,
       sum = a + b,
       myobject = {},
       i,
       j;
   // function body...
}


var el = document.getElementById('result') //缓存dom引用，避免每次使用都要查找

```
###  变量和声明提前

JavaScript中，你可以在函数的任何位置声明多个var语句，并且它们就好像是在函数顶部声明一样发挥作用，这种行为称为hoisting（悬置/置顶解析/预解析）。当你使用了一个变量，然后不久在函数中又重新声明的话，就可能产生逻辑错误。对于JavaScript，只要你的变量是在同一个作用域中（同一函数），它都被当做是声明的，即使是它在var声明前使用的时候。看下面这个例子：


```javascript
// 反例
myname = 'global'; // 全局变量
function func() {
    alert(myname); // 'undefined'
    var myname = 'local';
    alert(myname); // 'local'
}
func();
```

### for循环

在for循环中，你可以循环取得数组或是数组类似对象的值，譬如arguments和HTMLCollection对象。这种形式的循环的不足在于每次循环的时候数组的长度都要去获取下。这回降低你的代码执行效率，尤其当myarray不是数组，而是一个HTMLCollection对象的时候通常的循环形式如下


```javascript
// 反例
// 次佳的循环
for (var i = 0; i < myarray.length; i++) {
   // 使用myarray[i]做点什么
}
```

集合的麻烦在于它们实时查询基本文档（HTML页面）。这意味着每次你访问任何集合的长度，你要实时查询DOM，而DOM操作一般都是比较昂贵的.这就是为什么当你循环获取值时，缓存数组(或集合)的长度是比较好的形式，正如下面代码显示的：


```javascript
//当myarray是一个NodeList的时候更能凸显这种方法的优异性
for (var i = 0, max = myarray.length; i < max; i++) {
   // 使用myarray[i]做点什么
}
```

### for- in 循环

for-in循环应该用在非数组对象的遍历上，使用for-in进行循环也被称为“枚举”。从技术上将，你可以使用for-in循环数组（因为JavaScript中数组也是对象），但这是不推荐的。因为如果数组对象已被自定义的功能增强，就可能发生逻辑错误。另外，在for-in中，属性列表的顺序（序列）是不能保证的。所以最好数组使用正常的for循环，对象使用for-in循环。有个很重要的hasOwnProperty()方法，当遍历对象属性的时候可以过滤掉从原型链上下来的属性。思考下面一段代码


### (不)扩展内置原型

扩增构造函数的prototype属性是个很强大的增加功能的方法，但有时候它太强大了。增加内置的构造函数原型（如Object(), Array(), 或Function()）挺诱人的，但是这严重降低了可维护性，因为它让你的代码变得难以预测。使用你代码的其他开发人员很可能更期望使用内置的JavaScript方法来持续不断地工作，而不是你另加的方法。另外，属性添加到原型中，可能会导致不使用hasOwnProperty属性时在循环中显示出来，这会造成混乱。因此，不增加内置原型是最好的。


### switch形式

你可以通过类似下面形式的switch语句增强可读性和健壮性：

```javascript
var inspect_me = 0,
    result = '';
switch (inspect_me) {
case 0:
   result = 'zero';
   break;
case 1:
   result = 'one';
   break;
default:
   result = 'unknown';
}

//每个case和switch对齐（花括号缩进规则除外）
//每个case中代码缩进
//每个case以break清除结束
//避免贯穿（故意忽略break）。如果你非常确信贯穿是最好的方法，务必记录此情况，因为对于有些阅读人而言，它们可能看起来是错误的。
//以default结束switch：确保总有健全的结果，即使无情况匹配。
```

### 避免隐式类型转换

JavaScript的变量在比较的时候会隐式类型转换。这就是为什么一些诸如：false == 0 或 "" == 0 返回的结果是true。为避免引起混乱的隐含类型转换，在你比较值和表达式类型的时候始终使用===和!==操作符。

```javascript
var zero = 0;
if (zero === false) {
   // 不执行，因为zero为0, 而不是false
}

// 反面示例
if (zero == false) {
   // 执行了...
}
```

### 避免(Avoiding) eval()

__ 请避免使用这个方法，用其他方法代替来实现你想要的效果

### parseInt()下的数值转换(Number Conversions with parseInt())

使用parseInt()你可以从字符串中获取数值，该方法接受另一个基数参数，这经常省略，但不应该。当字符串以”0″开头的时候就有可能会出问题，例如，部分时间进入表单域，在ECMAScript 3中，开头为”0″的字符串被当做8进制处理了，但这已在ECMAScript 5中改变了。为了避免矛盾和意外的结果，总是指定基数参数。

```javascript
var month = '06',
    year = '09';
month = parseInt(month, 10);
year = parseInt(year, 10);
```

### 缩进

建议使用tab缩进（1tab === 4space)

### 花括号

花括号（亦称大括号，下同）应总被使用，即使在它们为可选的时候。技术上将，在in或是for中如果语句仅一条，花括号是不需要的，但是你还是应该总是使用它们，这会让代码更有持续性和易于更新。想象下你有一个只有一条语句的for循环，你可以忽略花括号，而没有解析的错误。

```javascript
//建议左花括号写在表达式后面
if(true) {  
   alert('It is TRUE!');
}

// 警告:意外的返回值
function func() {
   return
  // 下面代码不执行
   {
      name : 'Batman'
   }
}
```

### 命名规范
```javascript
构造函数：首字母大写
普通函数：驼峰式写法
文件命名：驼峰式写法
内部函数：前面加下划线_
```
### 空格
```javascript
//参数列表和for循环, 和 ; 前不允许有空格。
// good
callFunc(a, b);
for(var i = 0; i < 5; i++)

//比较操作符< , > , =两边加空格
if(a < b)
if(a == b)

//对象创建时，属性中的 : 两边必须有空格。
var obj = {
    a : 1,
    b : 2,
    c : 3
};

```

### 引号

js中单引号和双引号并没有明显的含义区分，用单引号和双引号都可以，但为了规范性，我们有一下建议

```javascript
//在html中用双引号，在js代码中用单引号
//<input type="file" value="upload"></input>
var a = "verisTest";
//注意，在json中必须用双引号，否则可能会出错
var jsonObj = {
	"a" : "1",
	"b" : 2
}
```

### 分号

分号代表某段语句的结束，在js中某些语句后面可以不加分号，因为js解析引擎正在解析代码的时候会自动识别并添加分号，但是并非所有情况都能正确识别，因此我们建议在每个结束语句后面都添加分号。

```javascript
a = b
(function(){
...
})()

会被解释为 a = b(function(){...})()

```
### 参考文章
1. [翻译-高质量JavaScript代码书写基本要点](http://www.zhangxinxu.com/wordpress/2010/10/%E7%BF%BB%E8%AF%91-%E9%AB%98%E8%B4%A8%E9%87%8Fjavascript%E4%BB%A3%E7%A0%81%E4%B9%A6%E5%86%99%E5%9F%BA%E6%9C%AC%E8%A6%81%E7%82%B9/)