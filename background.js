
'use strict';

chrome.runtime.onInstalled.addListener(function () {

  var event = document.createEvent('Event');

  event.initEvent('build', true, true);

  chrome.storage.sync.set({color: '#3aa757'}, function () {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {schemes: ['https','http']},
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });


  // chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  //   console.log("Received %o from %o, frame", msg, sender.tab, sender.frameId);
  //   sendResponse("Gotcha!");
  // });

  chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
      console.log('request bg', request);
      if (request.type === 'clickSaveFile') {

        // 给conten发消息
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          console.log('tabstabs',tabs)
          chrome.tabs.sendMessage(tabs[0].id, {type: "saveFile"})
        });
      }
      sendResponse("保存成功");
    }
  );

});



// chrome.webRequest.onCompleted.addListener(function(details){
//   // 请求完毕，返回的相关数据，都在details中
//   // 拿到数据后，可以通过chrome.extension.sendMessage({msg:"getNetworkResource", data:details});将数据通知popup.html
//   console.log('details',details)
// },{urls: ["<all_urls>"]},["responseHeaders"]);


// chrome.webRequest.onCompleted.addListener(function (details){
//       console.log(details);
//       return {responseHeaders: details.responseHeaders};
//     }, {
//       urls:['https://*/*', 'http://*/*'],
//       types: ["xmlhttprequest"]
//     },
//     [
//       "responseHeaders"
//     ]
// );

//
// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     console.log('details', details);
//     const {url, method, requestBody = {}} = details;
//     let postedString = '';
//     if (Object.keys(requestBody).length) {
//       postedString = decodeURIComponent(String.fromCharCode.apply(null,
//         new Uint8Array(requestBody.raw[0].bytes)));
//     }
//
//     console.log('postedString', {
//       url,
//       method,
//       postedString,
//     });
//     return {
//       responseHeaders: details.responseHeaders,
//       extraHeaders: details.extraHeaders,
//     };
//   },
//   {
//     urls: ['https://*/*', 'http://*/*'],
//     types: ["xmlhttprequest"]
//   },
//   [
//     "requestBody",
//   ]
// );


//
// chrome.webRequest.onResponseStarted.addListener(
//   function (details) {
//     console.log('details responseBody', details);
//     return {
//       responseHeaders: details.responseHeaders,
//       extraHeaders: details.extraHeaders,
//     };
//   },
//   {
//     urls: ['https://*/*', 'http://*/*'],
//     types: ["xmlhttprequest"]
//   },
//   [
//     // "responseBody",
//   ]
// );

// var s = document.createElement("script");
// s.src = chrome.extension.getURL("replaceAjax.js");
// console.log('injectAjax src',chrome.extension.getURL("replaceAjax.js"))
// s.onload = function() {
//   // this.remove();
//   console.log('injectAjax onload')
// };
// (document.head || document.documentElement).appendChild(s);


// chrome.runtime.onMessage.addListener(
//   function(message, callback) {
//     if (message == "runContentScript"){
//       chrome.tabs.executeScript({
//         file: 'replaceAjax.js'
//       });
//     }
//   });

//
// chrome.runtime.onMessage.addListener(function(message, callback) {
//     if (message === "runContentScript"){
//       chrome.tabs.executeScript({
//         file: 'inject.js'
//       });
//       console.log('执行demo')
//     }
//   console.log('执行demo111',message)
//   });

// chrome.tabs.executeScript({
//   // file: 'inject.js'
//   // file: 'replaceAjax.js'
//   code: 'document.body.style.backgroundColor="orange"'
// });

// chrome.app.runtime.onLaunched.addListener(function() {
//   chrome.app.window.create('popup.html', {
//     bounds: {
//       width: 500,
//       height: 300
//     }
//   });
// });
