'use strict';

var cupid = {
  profiles: [],
  tabId: 0,
  initCrawl: false,
  isCrawling: false,
  threshold: 0,
  keywords: ''
};

// Navigates to a URL
cupid.goToUrl = function(url) {
  chrome.tabs.update(cupid.tabId, {url:url});
}

cupid.getProfiles = function() {
  chrome.tabs.sendMessage(cupid.tabId, {type: 'crawl'});
}

cupid.scanProfile = function() {
  chrome.tabs.sendMessage(cupid.tabId, {type: 'scan', keywords: cupid.keywords, threshold: cupid.threshold});
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl_complete') {

    cupid.profiles = request.profiles;
    cupid.initCrawl = false;
    var profile = cupid.profiles.shift();

    if (profile !== undefined) {
      console.log('going to profile' + profile); 
      cupid.goToUrl('http://www.okcupid.com/profile/' + profile);
    }
    else {
      cupid.goToUrl('http://www.okcupid.com/home');
    }

  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'profile_scanned') {
    
    if (cupid.profiles.length === 0) {
      cupid.isCrawling = false;
      return;
    }

    do {
      var profile = cupid.profiles.shift();
    } while (profile === undefined && cupid.profiles.length > 0);

    cupid.goToUrl('http://www.okcupid.com/profile/' + profile);

  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && cupid.tabId == tabId) {
    if (cupid.initCrawl) {
      // you have not populated profiles array, crawl matches.
      console.log('inside initCrawl block');
      cupid.getProfiles(); 
    }
    else {
      console.log('inside scan block');
      cupid.scanProfile();
    }
  }
  
});

