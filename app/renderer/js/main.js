onload = function () {
	const {shell} = require('electron');
	const webview = document.querySelector('webview');
	const loading = document.querySelector('#loader');

	function onStopLoad() {
		loading.classList.add('hide');
	}

	function onStartLoad() {
		loading.classList.remove('hide');
	}
	
	webview.addEventListener('new-window', e => {
		const protocol = require('url').parse(e.url).protocol;
		if (protocol === 'http:' || protocol === 'https:') {
			shell.openExternal(e.url);
		}
	});
	
	webview.addEventListener('did-stop-loading', onStopLoad);
	webview.addEventListener('did-start-loading', onStartLoad);
};
