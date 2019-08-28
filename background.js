'use strict';
const  defaultConfig = {
  status: 'recording' ,// stop recording
};

chrome.runtime.onInstalled.addListener(function () {

  // 设置默认配置
  chrome.storage.sync.set(defaultConfig);

  // 设置点击icon展示操作面板
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {schemes: ['https','http']},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  // 监听用户操作,执行相应业务逻辑
  chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {

      if (request.type === 'exportApiPluginMsgFromPopup') {

        // 给content发消息
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          console.log('tabs',tabs)
          chrome.tabs.sendMessage(tabs[0].id, {type: 'exportApiPluginMsgFromBg', cmd: request.cmd});
        });
      }
    sendResponse("bg process finished");
    }
  );

});
