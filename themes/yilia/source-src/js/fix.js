import {decode} from './util'

function init() {
	// 由于hexo分页不支持，手工美化
	var $nav = document.querySelector('#page-nav')
	if ($nav && !document.querySelector('#page-nav .extend.prev')) {
		$nav.innerHTML = '<a class="extend prev disabled" rel="prev">&laquo; Prev</a>' + $nav.innerHTML
	}
	if ($nav && !document.querySelector('#page-nav .extend.next')) {
		$nav.innerHTML = $nav.innerHTML + '<a class="extend next disabled" rel="next">Next &raquo;</a>'
	}

	// 新窗口打开
	if (yiliaConfig && yiliaConfig.open_in_new) {
		let $a = document.querySelectorAll(('.article-entry a:not(.article-more-a)'))
		$a.forEach(($em) => {
			$em.setAttribute('target', '_blank')
		})
	}

	// 标签
	var $tags = document.querySelectorAll('.tagcloud a')
	$tags.forEach(($em) => {
		$em.style.fontSize = '12px'
		var num = $em.innerHTML.length % 5 + 1
		$em.className = 'color' + num
	})

	// about me 转义
	var $aboutme = document.querySelector('#js-aboutme')
	if ($aboutme && $aboutme.length !== 0) {
		$aboutme.innerHTML = decode($aboutme.innerHTML)
	}
}

module.exports = {
	init: init
}