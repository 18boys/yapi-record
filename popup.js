let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function (data) {
    // changeColor.style.backgroundColor = data.color;
    // changeColor.setAttribute('value', data.color);
});

exportFile.onclick = function (e) {
    const {cmd} = e.target.dataset;
    if (!cmd) return alert('操作无效');
    console.log('cmdcmd', cmd);
    chrome.extension.sendMessage({type: 'exportApiPluginMsgFromPopup', cmd,}, function (response) {
        console.log(response);
    }); //测试前台掉后台
};
