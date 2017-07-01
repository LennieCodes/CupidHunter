// Returns unique elements of an array.
function unique(array) {
  return array.filter(function(el, index, arr) {
    return index == arr.indexOf(el);
  });
}

function getProfiles() {
    var profiles = [];
    // code review this.
    $('[data-profile-popover]').each(function() {
        var profile = $(this).attr('href');
        if (profile == undefined) return [];
        profile = profile.split('?')[0];
        profile = profile.split('/profile/')[1];
        profiles.push(profile);
    });
    return profiles;
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl') {
    var profiles = getProfiles();
    profiles = unique(profiles);
    chrome.runtime.sendMessage({profiles: profiles, type: 'crawl complete'});
  }
  
  sendResponse({status: 'Profile has been crawled.'});
});
