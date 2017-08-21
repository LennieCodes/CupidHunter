var messages = [
  'Hey, My name is Lennie. I really like your profile. How are you?',
  'Hey I checked out your profile and you seem cool. What are you up to?',
  'Hey I checked out your profile and you seem cool. How\'s your day going?'
];

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


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

function sendMessageToProfile() {
  var index = Math.floor(Math.random() * 3);
  $('button.actions2015-chat').click();
  sleep(2000).then(function() {
    $('.inputcontainer').find($('textarea:not(.clone)')).val(messages[index]);
    $('form.compose.okform').find(':submit').click();
  });
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == 'crawl') {
    var profiles = getProfiles();
    console.log(profiles);
    chrome.runtime.sendMessage({profiles: profiles, type: 'crawl_complete'});
  }
  else if (request.type == 'message') {
    sendMessageToProfile();
    sleep(5000).then(function() {
      chrome.runtime.sendMessage({type: 'message_sent'});
    });

  }
});
