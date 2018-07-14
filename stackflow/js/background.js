chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(tab.id, {file:'after_click.js'}, function () {

    });
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        chrome.tabs.executeScript(tab.id, {file:'after_load.js'}, function () {
            
//            setInterval(function () {chrome.tabs.sendMessage(tab.id, {bl:"input", url:tab.url});}, 3000);
            
        });   
    }
});

function setItem(key, value) {
    try {
      log("Inside setItem:" + key + ":" + value);
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    }catch(e) {
      log("Error inside setItem");
      log(e);
    }
    log("Return from setItem" + key + ":" +  value);
}

function getItem(key) {
    var value;
    log('Get Item:' + key);
    try {
      value = window.localStorage.getItem(key);
    }catch(e) {
      log("Error inside getItem() for key:" + key);
      log(e);
      value = "null";
    }
    log("Returning value: " + value);
    return value;
}

function clearStrg() {
    log('about to clear local storage');
    window.localStorage.clear();
    log('cleared');
}

function log(txt) {
}