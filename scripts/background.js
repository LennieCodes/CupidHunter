'use strict';

var cupid = {
  profiles: [],
  crawlLimit: 0,
  tabId: 0,
  profilesCrawled: 0,
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
    cupid.profilesCrawled += request.profiles;
    cupid.profiles = cupid.profiles.concat(request.profiles);

    if (cupid.profilesCrawled >= cupid.crawlLimit) {
      cupid.initCrawl = false;
    }

    var profile = cupid.profiles.shift();

    if (profile !== undefined) {
      // use first profile to trigger another crawl, and add to end of array.
      cupid.profiles.push(profile);
      cupid.goToUrl('http://www.okcupid.com/profile/' + profile);
    }
    else {
      cupid.goToUrl('http://www.okcupid.com/home');
    }

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
      if (profile !== undefined) {
        cupid.goToUrl('http://www.okcupid.com/profile/' + profile);
      }
      else {
        cupid.goToUrl('http://www.okcupid.com/home');
      }

    }
  }
  
});

