'use strict';

// Return unique elements of an array
function unique(array){
  return array.filter(function(el, index, arr) {
    return index == arr.indexOf(el);
  });
}

var cupid = {
  profiles: [],
  crawlLimit: 0,
  tabId: 0,
  initCrawl: false,
  isCrawling: false
};

// Navigates to a URL
cupid.goToUrl = function(url) {
  chrome.tabs.update(cupid.tabId, {url:url});
}

cupid.getProfiles = function() {
  chrome.tabs.sendMessage(cupid.tabId, {type: 'crawl'});
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'crawl complete') {
    cupid.profiles = cupid.profiles.concat(request.profiles);
    cupid.profiles = unique(cupid.profiles);

    if (cupid.profiles.length >= cupid.crawlLimit) {
      cupid.initCrawl = false;
    }    

    var profile = cupid.profiles.shift();
    cupid.goToUrl('http://www.okcupid.com/profile/' + profile);
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && cupid.tabId == tabId) {
    if (cupid.initCrawl) {
      // if you have not populated profiles array, continue to crawl.
      cupid.getProfiles(); 
    }
    else {
      // start visiting profiles.
      if (cupid.profiles.length === 0) {
        cupid.isCrawling = false;
        return;
      }
       
      var profile = cupid.profiles.shift();
      cupid.goToUrl('http://www.okcupid.com/profile/' + profile);
    }
  }
  
});

