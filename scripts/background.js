'use strict';

var cupid = {
  profiles: [],
  crawlLimit: 0,
  tabId: 0,
  profilesCrawled: 0,
  initCrawl: false,
  isCrawling: false,
  messageCount: 0
};

// Navigates to a URL
cupid.goToUrl = function(url) {
  chrome.tabs.update(cupid.tabId, {url:url});
}

cupid.getProfiles = function() {
  chrome.tabs.sendMessage(cupid.tabId, {type: 'crawl'});
}

cupid.sendMessageToProfile = function() {
  chrome.tabs.sendMessage(cupid.tabId, {type: 'message'});
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl_complete') {

    cupid.profilesCrawled += request.profiles.length;
    console.log('profiles crawled:', cupid.profilesCrawled);
    console.log('crawlLimit', cupid.crawlLimit);
    cupid.profiles = cupid.profiles.concat(request.profiles);

    if (cupid.profilesCrawled >= cupid.crawlLimit) {
      cupid.initCrawl = false;
    }

    var profile = cupid.profiles.shift();

    if (profile !== undefined) {
      console.log('going to profile' + profile);
      // use first profile to trigger another crawl, and add to end of array.
      // if you are no longer crawling, you are going to visit this profile and send a message.
      // so no need to add them back to the array (which would send them another message!). 
      if (cupid.initCrawl) {
        cupid.profiles.push(profile);
      }
      cupid.goToUrl('http://www.okcupid.com/profile/' + profile);
    }
    else {
      cupid.goToUrl('http://www.okcupid.com/home');
    }

  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'message_sent') {
    cupid.messageCount++;
    
    if (cupid.profiles.length === 0) {
      cupid.isCrawling = false;
      return;
    }

    do {
      var profile = cupid.profiles.shift();
    } while (profile === undefined);

    console.log('sending message to:' + profile);
    cupid.goToUrl('http://www.okcupid.com/profile/' + profile);

  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && cupid.tabId == tabId) {
    if (cupid.initCrawl) {
      // if you have not populated profiles array, continue to crawl.
      console.log('inside initCrawl block');
      cupid.getProfiles(); 
    }
    else {
      console.log('inside Message block');
      cupid.sendMessageToProfile();
    }
  }
  
});

