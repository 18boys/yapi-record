;(function () {

    const template = {
        name: "yapi-record",
        list: []
    };
    let isCanRecord = true;
    const getListItemTemplate = {
        "query_path": {
            "path": "",
            "params": []
        },
        "status": "done",
        "type": "static",
        "req_body_is_json_schema": true,
        "res_body_is_json_schema": false,
        "api_opened": false,
        "method": "GET",
        "title": "", // 接口名字
        "path": "", // 接口路径
        "req_params": [],
        "res_body_type": "json",
        "req_query": [], //  查询条件
        "req_headers": [],
        "req_body_form": [],
        "res_body": "{}", // get响应值, string化的json
        "req_body_type": "raw"
    };

    const postListItemTemplate = {
        "query_path": {
            "path": "",
            "params": []
        },
        "status": "done",
        "type": "static",
        "req_body_is_json_schema": false,
        "res_body_is_json_schema": false,
        "api_opened": false,
        "method": "POST",
        "title": "",  // 接口名字
        "path": "", // 接口路径
        "req_params": [],
        "res_body_type": "json",
        "req_query": [],
        "req_headers": [
            {
                "required": "1",
                "name": "Content-Type",
                "value": "application/json"
            }
        ],
        "req_body_form": [],
        "res_body": "{}",  // post请求参数
        "req_body_type": "json",
        "req_body_other": "{}" // post响应参数
    };

    const cacheRecord = JSON.parse(JSON.stringify(template));

    function processGetRecord(response) {
        let templateObj = JSON.parse(JSON.stringify(getListItemTemplate));
        let urlObj = new URL(this.responseURL);
        templateObj.path = urlObj.pathname;
        templateObj.title = urlObj.pathname;
        for ([key, value] of urlObj.searchParams.entries()) {
            templateObj.req_query.push({
                required: '1',
                name: key,
                example: value,
                desc: '',
            })
        }
        templateObj.res_body = response.target.responseText;
        cacheRecord.list.push(templateObj);
        // console.table({
        //     '请求方法': 'get',
        //     '请求路径': templateObj.path,
        //     '请求参数': JSON.stringify(templateObj.req_query),
        //     '请求结果': templateObj.res_body,
        // })
    }


    function processPOSTRecord(response) {
        let templateObj = JSON.parse(JSON.stringify(postListItemTemplate));
        let urlObj = new URL(this.responseURL);
        templateObj.path = urlObj.pathname;
        templateObj.title = urlObj.pathname;
        templateObj.req_body_other = this.requestData;
        templateObj.res_body = response.target.responseText;
        cacheRecord.list.push(templateObj);
        // console.table({
        //     '请求方法': 'post',
        //     '请求路径': templateObj.path,
        //     '请求参数': templateObj.req_body_other,
        //     '请求结果': templateObj.res_body,
        // })
    }


    function recordResponse(method, response) {
        if(!isCanRecord) return;
        if (this.readyState !== 4 || this.status !== 200) return;
        if (!this.responseURL || !method) return;
        // console.log('url',this);
        switch (method) {
            case 'GET' :
                processGetRecord.call(this, response);
                break;
            case 'POST' :
                processPOSTRecord.call(this, response);
                break;
            default:
                void 0;
        }
        // originalResponse = response.target.responseText;
        // ajaxList.push(this.getAllResponseHeaders());
        // ajaxList.push(this.requestData);
        // ajaxList.push(originalResponse);
        // ajaxList.push(method);
        // ajaxList.push(url);
    }

    function curryFun(originFunc, context) {
        var args = Array.prototype.slice.call(arguments, 2);
        return function () {
            var newArgs = args.concat(Array.prototype.slice.call(arguments, 0));
            originFunc.apply(context, newArgs);
        }
    }

    function reWriteOpen(originOpen) {

        return function (method) {
            this.addEventListener("readystatechange", curryFun(recordResponse, this, method));
            return originOpen.apply(this, arguments);
        };
    }


    function reWriteSend(originSend) {
        return function (data) {
            // 保存请求相关参数
            this.requestData = data;
            return originSend.apply(this, arguments);
        };
    }

    XMLHttpRequest.prototype.open = reWriteOpen(XMLHttpRequest.prototype.open);
    XMLHttpRequest.prototype.send = reWriteSend(XMLHttpRequest.prototype.send);

    /* FileSaver.js
     * A saveAs() FileSaver implementation.
     * 1.3.2
     * 2016-06-16 18:25:19
     *
     * By Eli Grey, http://eligrey.com
     * License: MIT
     *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
     */

    /*global self */
    /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

// todo 侵入正常的作用域,需要处理避免变量冲突
    var saveAs = saveAs || (function (view) {
        "use strict";
        // IE <10 is explicitly unsupported
        if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var
            doc = view.document
            // only get URL when necessary in case Blob.js hasn't overridden it yet
            , get_URL = function () {
                return view.URL || view.webkitURL || view;
            }
            , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
            , can_use_save_link = "download" in save_link
            , click = function (node) {
                var event = new MouseEvent("click");
                node.dispatchEvent(event);
            }
            , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
            , is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent)
            , throw_outside = function (ex) {
                (view.setImmediate || view.setTimeout)(function () {
                    throw ex;
                }, 0);
            }
            , force_saveable_type = "application/octet-stream"
            // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
            , arbitrary_revoke_timeout = 1000 * 40 // in ms
            , revoke = function (file) {
                var revoker = function () {
                    if (typeof file === "string") { // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else { // file is a File
                        file.remove();
                    }
                };
                setTimeout(revoker, arbitrary_revoke_timeout);
            }
            , dispatch = function (filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver["on" + event_types[i]];
                    if (typeof listener === "function") {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            }
            , auto_bom = function (blob) {
                // prepend BOM for UTF-8 XML and text/* types (including HTML)
                // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
                }
                return blob;
            }
            , FileSaver = function (blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                // First try a.download, then web filesystem, then object URLs
                var
                    filesaver = this
                    , type = blob.type
                    , force = type === force_saveable_type
                    , object_url
                    , dispatch_all = function () {
                        dispatch(filesaver, "writestart progress write writeend".split(" "));
                    }
                    // on any filesys errors revert to saving with object URLs
                    , fs_error = function () {
                        if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                            // Safari doesn't allow downloading of blob urls
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                                var popup = view.open(url, '_blank');
                                if (!popup) view.location.href = url;
                                url = undefined; // release reference before dispatching
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                            };
                            reader.readAsDataURL(blob);
                            filesaver.readyState = filesaver.INIT;
                            return;
                        }
                        // don't create more object URLs than needed
                        if (!object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (force) {
                            view.location.href = object_url;
                        } else {
                            var opened = view.open(object_url, "_blank");
                            if (!opened) {
                                // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                                view.location.href = object_url;
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    }
                ;
                filesaver.readyState = filesaver.INIT;

                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    setTimeout(function () {
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        dispatch_all();
                        revoke(object_url);
                        filesaver.readyState = filesaver.DONE;
                    });
                    return;
                }

                fs_error();
            }
            , FS_proto = FileSaver.prototype
            , saveAs = function (blob, name, no_auto_bom) {
                return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
            }
        ;
        // IE 10+ (native saveAs)
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function (blob, name, no_auto_bom) {
                name = name || blob.name || "download";

                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                return navigator.msSaveOrOpenBlob(blob, name);
            };
        }

        FS_proto.abort = function () {
        };
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error =
            FS_proto.onwritestart =
                FS_proto.onprogress =
                    FS_proto.onwrite =
                        FS_proto.onabort =
                            FS_proto.onerror =
                                FS_proto.onwriteend =
                                    null;

        return saveAs;
    }(
        typeof self !== "undefined" && self
        || typeof window !== "undefined" && window
        || this.content
    ));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

// function outputFile(){
//     if (!cacheRecord.list.length) return; // 看下为什么会需要两次弹窗,  看起来 两个 origin都发过来origin了
//     const fileContent = JSON.stringify([cacheRecord]);
//     var file = new File([fileContent], "yapi-record.json", { type: "text/plain;charset=utf-8" });
//     saveAs(file);
// }
//
// function clearRecord(){
//     cacheRecord.list = [];
// }

    const CMD = {
        exportFile() {
            if (!cacheRecord.list.length) return alert('没有可以下载的数据'); // 看下为什么会需要两次弹窗,  看起来 两个 origin都发过来origin了
            const fileContent = JSON.stringify([cacheRecord]);
            var file = new File([fileContent], "yapi-record.json", {type: "text/plain;charset=utf-8"});
            saveAs(file);
        },
        clearRecord() {
            cacheRecord.list = [];
        },
        startRecord() {
            isCanRecord = true;
        },
        stopRecord(){
            isCanRecord = false;
        }
    };


    window.addEventListener("message", function (event) {
        console.log('replaceAjax:', event);
        if (event.source !== window || !event.data || event.data.type !== 'exportApiPluginMsgFromInject' || !event.data.cmd) return;
        if (typeof CMD[event.data.cmd] !== 'function') {
            alert(`${event.data.cmd}不是合法的操作`)
            return;
        }
        CMD[event.data.cmd]();
    }, false);

})();

