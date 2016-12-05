---
title: 短小精悍的js代码段
date: 2016-09-22 12:23:56
categories: [javascript]
tags: javascript
keywords: [短小精悍的js代码片段]
---

### 前言
<p>
	一些令叹为观止的js精巧代码
</p>

<!--more-->

***
<br>

### js代码段
<p>
	生成随机颜色
</p>
```javascript
// 生成十六进制的随机颜色
let color16 = function () {
	return "#" + (function (color) {
	    return new Array(7 - color.length).join("0") + color;
	})((Math.random() * 0x1000000 << 0 ).toString(16));
};
color16();        // "#dd90f2"
color16();        // "#d8b15e"
color16();        // "#036f98"
```
<p>
	生成固定位数的随机id
</p>
```javascript
// 生成固定位数的随机id
function generateTipId () {
	var tipId = '';
	for (; tipId.length < 16; tipId += Math.random().toString(36).substr(2));
	return tipId.substr(0, 16);
};
generateTipId()   // "tbi34lo197o3z7y7"
generateTipId()   // "qgpyetdfp1hhdy2y"
generateTipId()   // "0qz3mcts495rg126"
```

