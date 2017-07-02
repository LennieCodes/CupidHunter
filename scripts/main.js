// Returns unique elements of an array.
function unique(array) {
  return array.filter(function(el, index, arr) {
    return index == arr.indexOf(el);
  });
}

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

function getProfiles() {
    var profiles = [];
    // code review this.
    $('.image_link').each(function() {
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
    if (localStorage.getItem('visitedProfiles') === null) {
      localStorage.setObj('visitedProfiles', []);
    }
    var profiles = getProfiles();
    console.log(profiles.length);
    profiles = unique(profiles);
    chrome.runtime.sendMessage({profiles: profiles, type: 'crawl complete'});
  }
  
  sendResponse({status: 'Profile has been crawled.'});
});
