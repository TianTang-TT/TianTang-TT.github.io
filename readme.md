### 博客源码分支

	换了电脑之后会丢失保存在电脑上的博客源码，我们可以考虑将源码放到不同的分支上，每次换机之后只需要克隆该分支，就可以恢复原数据

##### 切换步骤
	1. 克隆博客仓库
	`git clone git@github:TianTang-TT/TianTang-TT.github.io.git`

	2. 克隆hexo分支到本地
	`git checkout -b hexo origin/hexo`

	3. 安装依赖
	`npm i`，`npm i -g hexo`

	4. 启动hexo
	`hexo s`

	5. 打开`localhost:3000`查看效果