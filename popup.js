let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);

});

changeColor.onclick = function(element) {
    chrome.extension.sendMessage(  {type: 'clickSaveFile'}, function(response) {  console.log(response); }  );//测试前台掉后台
};
