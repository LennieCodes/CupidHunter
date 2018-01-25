function crawlPage(stopper) {
  console.log('crawlPage called');
  document.documentElement.scrollTop = document.documentElement.scrollTop + 2550;
  setTimeout(getProfiles(), 3000);

  // you've reached the bottom of the page
  if ($('#match_bs').length !== 0) {
    window.clearInterval(stopper);
    console.log('reached bottom of the well');
    let profiles = JSON.parse(localStorage.getItem("profileCache"));
    chrome.runtime.sendMessage({profiles: profiles, type: 'crawl_complete'});
  }
}

function getProfiles() {
  var profileCache = JSON.parse(localStorage.getItem("profileCache"));

  // TODO: go through every message sent and add to profileCache if null
  if (profileCache === null) {
    profileCache = [];
    localStorage.setItem("profileCache", JSON.stringify(profileCache));
  }

  // code review this.
  $('.image_link').not('.image_link.visited').each(function() {
      var profile = extractProfileName($(this).attr('href'));
      if (profileCache.indexOf(profile) === -1) {
        profileCache.push(profile);
      }
  });

  $('.image_link').addClass('visited');

  localStorage.setItem("profileCache", JSON.stringify(profileCache));
}

function extractProfileName(profile) {
    if (profile == undefined) return [];
    profile = profile.split('?')[0];
    profile = profile.split('/profile/')[1];

    return profile;
}

function scanProfile(keywords, threshold) {
  
  const keywordArr = keywords.trim().split(/\s*,\s*/);
  
  let regExpArr = [];
  let keywordMap = [];
  for (let i = 0; i < keywordArr.length; i++) {
    regExpArr.push(new RegExp(keywordArr[i], "ig"));
  }

  $('.profile-essay').each(function() {
    
    let content = $(this).html();
    
    for (let i = 0; i < regExpArr.length; i++) {
      content = content.replace(regExpArr[i], function(match) {
        if (keywordMap.indexOf(match) === -1) {
          keywordMap.push(match);
        }
        return match;  
      });
    }

  });

  if (keywordMap.length >= threshold) {
    let matchCache = JSON.parse(localStorage.getItem("matchCache"));
    
    if (matchCache === null) {
      matchCache = [];
    }

    matchCache.push({url: window.location.href, count: keywordMap.length});

    localStorage.setItem("matchCache", JSON.stringify(matchCache));
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl') {
    // bug here - setInterval doesn't work in content script
    var stopper = window.setInterval(function() {
      crawlPage(stopper);
    }, 5000);
  }
  else if (request.type == 'scan') {
    scanProfile(request.keywords, request.threshold);
    chrome.runtime.sendMessage({type: 'profile_scanned'});
  }
});
