// this is the background code...

// listen for our browerAction to be clicked
chrome.tabs.onUpdated.addListener(function (tab) {
		//alert(tab)

	if(localStorage.operation == "ManualBuildStart" && localStorage.tabID == tab)
	{	
		chrome.tabs.executeScript(tab.ib, {
			file: 'Manual.js'
		});
				
	}
	
	if(localStorage.operation == "automateBuild" && localStorage.tabID == tab)
	{
		chrome.tabs.executeScript(tab.ib, {
			file: 'Auto.js'
		});
		localStorage.operation = "ManualBuildStop"
	}
	
});


chrome.tabs.onRemoved.addListener(function(tabid, removed) {
 //alert("tab closed")
 if(localStorage.tabID == tabid)
 	localStorage.operation = "ManualBuildStop";
})


chrome.windows.onRemoved.addListener(function(windowid) {
 //alert("window closed")
  if(localStorage.tabID == tabid)
	 localStorage.operation = "ManualBuildStop";
})


function setTime5(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setTime5 = "true";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}

function setTime10(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setTime10 = "true";';
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

function setRecordVerify(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setRecordVerify = "true";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}
function setStopRecordVerify(info,tab) {
	chrome.tabs.getSelected(null, function(tab) {
  			var code = 'sessionStorage.setRecordVerify = "false";';
  			chrome.tabs.executeScript(tab.id, {code: code});
		});	
		}


chrome.contextMenus.create({
  title: "Record Verify Logic", 
  contexts:["all"], 
  onclick: setRecordVerify,
});

chrome.contextMenus.create({
  title: "Stop Recording Verify Logic", 
  contexts:["all"], 
  onclick: setStopRecordVerify,
});

chrome.contextMenus.create({
  title: "Add time.sleep(5)", 
  contexts:["all"], 
  onclick: setTime5,
});

chrome.contextMenus.create({
  title: "Add time.sleep(10)", 
  contexts:["all"], 
  onclick: setTime10,
});

chrome.contextMenus.create({
  title: "Verify This", 
  contexts:["all"], 
  onclick: setVerify,
});

chrome.contextMenus.create({
  title: "Loop Start", 
  contexts:["all"], 
  onclick: setLoop,
});

chrome.contextMenus.create({
  title: "Loop End", 
  contexts:["all"], 
  onclick: endLoop,
});

chrome.contextMenus.create({
  title: "Add Table Verification", 
  contexts:["all"], 
  onclick: setTableVerify,
});
