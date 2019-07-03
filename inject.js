var s = document.createElement("script");
s.src = chrome.runtime.getURL("replaceAjax.js");
// console.log('injectAjax src',chrome.runtime.getURL("replaceAjax.js"),document)
s.onload = function () {
  // this.remove();
  // console.log('injectAjax onload')


  // 不能写在外面会导致 onMessage undefined
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('requestrequestrequest',request)
    if(request.type === 'saveFile'){
      window.postMessage('saveFile', '*')
    }
  });
};
(document.head || document.documentElement).appendChild(s);

// document.documentElement.addEventListener('build', function (e) {
//   // e.target matches elem
//   console.log('eee', e)
// }, false);

//
// chrome.extension.onMessage.addListener(
//   function (request, sender, sendResponse) {
//     console.log('request inject', request);
//     if (request.type === 'clickSaveFile') {
//       window.postMessage('saveFile', '*')
//       alert('inject 接受到保存文件的消息')
//     }
//     sendResponse("保存成功");
//   }
// );

// window.inject = 'inject';
// document.inject = 'inject';

// window.addEventListener("message", function (event) {
//     console.log('inject msg', event)
//     if (event.source != window) {
//       return;
//     }
//     console.log(event.data);
//   },
//   false
// );


// 给extension发消息
// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//   console.log('responseresponseresponse',response);
// });




