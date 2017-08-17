function getProfiles() {
    var profiles = [];
    var profileCache = JSON.parse(localStorage.getItem("profileCache"));

    // TODO: go through every message sent and add to profileCache if null
    if (profileCache === null) {
      profileCache = [];
      localStorage.setItem("profileCache", JSON.stringify(profileCache));
    }

    // code review this.
    $('[data-profile-popover]').each(function() {
        var profile = extractProfileName($(this).attr('href'));
        if (profileCache.indexOf(profile) === -1) {
          profiles.push(profile);
          profileCache.push(profile);
        }
    });

    localStorage.setItem("profileCache", JSON.stringify(profileCache));
    
    return profiles;
}

function extractProfileName(profile) {
    if (profile == undefined) return [];
    profile = profile.split('?')[0];
    profile = profile.split('/profile/')[1];

    return profile;
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl') {
    var profiles = getProfiles();
    chrome.runtime.sendMessage({profiles: profiles, type: 'crawl complete'});
  }
  
  sendResponse({status: 'Profile has been crawled.'});
});
