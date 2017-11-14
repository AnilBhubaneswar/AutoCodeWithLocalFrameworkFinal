document.addEventListener('DOMContentLoaded', function() {
  var automateBuildButton = document.getElementById('AutomateBuild');
  var manualBuildStartButton = document.getElementById('ManualBuildStart');
  var manualBuildStopButton = document.getElementById('ManualBuildStop');

  
  manualBuildStartButton.addEventListener('click',function()
  {
  	localStorage.operation = "ManualBuildStart";
	
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'window.location.reload();';
        localStorage.tabID = tab.id
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
  	
  });

  manualBuildStopButton.addEventListener('click',function()
  {
  	localStorage.operation = "ManualBuildStop";

  chrome.tabs.getSelected(null, function(tab) {
        var code = 'sessionStorage.clear();';
        localStorage.tabID = tab.id
        chrome.tabs.executeScript(tab.id, {code: code});
    }); 
	
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'window.location.reload();';
        localStorage.tabID = tab.id
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
  	
  });

  automateBuildButton.addEventListener('click',function()
  {
  	localStorage.operation = "automateBuild";
	
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'window.location.reload();';
        localStorage.tabID = tab.id
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
  	
  });
	
}, false);
