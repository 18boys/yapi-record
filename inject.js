;(function () {
var s = document.createElement("script");
s.src = chrome.runtime.getURL("replaceAjax.js");
s.onload = function () {

  // 不能写在外面会导致 onMessage undefined
  chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    if(data.type === 'exportApiPluginMsgFromBg'){
      window.postMessage({type: 'exportApiPluginMsgFromInject', cmd: data.cmd}, '*')
    }
  });
};
(document.head || document.documentElement).appendChild(s);

})();





