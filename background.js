// this is the background code...

// listen for our browerAction to be clicked
chrome.tabs.onUpdated.addListener(function (tab) {	
	if(localStorage.operation == "ManualBuildStart")
	{	
		chrome.tabs.executeScript(tab.ib, {
			file: 'Manual.js'
		});
		
	}
	
	if(localStorage.operation == "automateBuild")
	{
		chrome.tabs.executeScript(tab.ib, {
			file: 'Auto.js'
		});
		localStorage.operation = "ManualBuildStop"
	}
	
});

function setTime(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setTime = "true";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}


function setVerify(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setVerify = "true";;';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});
		}	

function setLoop(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setLoop = "true";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}

function endLoop(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.endLoop = "true";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}

function setTableVerify(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setTableVerify = "true";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}


chrome.contextMenus.create({
  title: "Add time.sleep(2)%s", 
  contexts:["all"], 
  onclick: setTime,
});

chrome.contextMenus.create({
  title: "Add Verify Logic%s", 
  contexts:["all"], 
  onclick: setVerify,
});

chrome.contextMenus.create({
  title: "Loop Start%s", 
  contexts:["all"], 
  onclick: setLoop,
});

chrome.contextMenus.create({
  title: "Loop End%s", 
  contexts:["all"], 
  onclick: endLoop,
});

chrome.contextMenus.create({
  title: "Add Table Verification%s", 
  contexts:["all"], 
  onclick: setTableVerify,
});
