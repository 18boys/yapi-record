let page = document.getElementById('buttonDiv');
const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];
function constructOptions(kButtonColors) {
    for (let item of kButtonColors) {
        let button = document.createElement('button');
        button.style.backgroundColor = item;
        button.addEventListener('click', function() {
            // js之间通信方式之一 storage 这种最简单 然后就是消息机制.貌似
            // storage这种通信方式会影响到所有页面的配置
            chrome.storage.sync.set({color: item}, function() {
                console.log('color is ' + item);
            })
        });
        page.appendChild(button);
    }
}
constructOptions(kButtonColors);
