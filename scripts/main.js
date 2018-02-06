const profilesToVisit = [];

function crawlPage(stopper) {
  console.log('crawlPage called');
  document.documentElement.scrollTop = document.documentElement.scrollTop + 2550;
  setTimeout(getProfiles(), 3000);

  // you've reached the bottom of the page
  if ($('#match_bs').length !== 0) {
    window.clearInterval(stopper);
    console.log('reached bottom of the well');

    chrome.runtime.sendMessage({profiles: profilesToVisit, type: 'crawl_complete'});
  }
}

function getProfiles() {
  let visitedProfilesCache = JSON.parse(localStorage.getItem("visitedProfilesCache"));

  if (visitedProfilesCache === null) {
    visitedProfilesCache = [];
    localStorage.setItem("visitedProfilesCache", JSON.stringify(visitedProfilesCache));
  }

  // code review this.
  $('.image_link').not('.image_link.visited').each(function() {
      var profile = extractProfileName($(this).attr('href'));
      if (visitedProfilesCache.indexOf(profile) === -1) {
        visitedProfilesCache.push(profile);
        profilesToVisit.push(profile);
      }
  });

  $('.image_link').addClass('visited');

  localStorage.setItem("visitedProfilesCache", JSON.stringify(visitedProfilesCache));
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
    let resultCache = JSON.parse(localStorage.getItem("resultCache"));
    
    if (resultCache === null) {
      resultCache = [];
    }

    resultCache.push({url: window.location.href, count: keywordMap.length});

    localStorage.setItem("resultCache", JSON.stringify(resultCache));
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl') {
    var stopper = window.setInterval(function() {
      crawlPage(stopper);
    }, 5000);
  }
  else if (request.type == 'scan') {
    scanProfile(request.keywords, request.threshold);
    chrome.runtime.sendMessage({type: 'profile_scanned'});
  }
});
