 (function() {
  var locatorDocumentContent = ""
  var scriptDocumentContent = ""
  var dataDocumentContent = ""
  var verifyScriptDocumentContent = ""
  var currentPageAddress = ""
  var currentClassName = ""
  var needToAddWaitCommand = "no"
   
  var currentClickedElementIndex = 0
   
  // For Add/Edit Methods
  var collectInfo = []


  // For Tab (Selenium Intendation)
  var tab = ""
  var tab1 = "&nbsp;&nbsp;&nbsp;&nbsp;"
  var tab2 = tab1 + tab1
  var tab3 = tab1 + tab1 + tab1

  // for Manual Operation
  var window_handle = ""
   
  // New 
  var current_index = 0
  var currentIncrementCounter = 0
  var allElementsArray = new Array()
  var allElements = document.getElementsByTagName("*")
  for (var i=0, len = allElements.length;i < len;i++){
    allElements[i].index = i;
  }
   
  for(var i=0;i<allElements.length;i++)
  {
    allElementsArray.push(allElements[i])
  }
   
   
   
  function getCurrentCounter(index)
  {
    incrementTemp = .0001
    var decimal = 0
    strIndex = index.toString()
    temp = strIndex.split(".")
   
    if (temp[1] != undefined)
    {
      decimal  = temp[1].length
    }
   
    for(var i=0;i<decimal;i++)
    {
      incrementTemp = incrementTemp * .1
    }
    return incrementTemp
  }
   
  function indexAllElements(custom)
  {
    incrementTemp = getCurrentCounter(current_index)
    var allEle = custom.getElementsByTagName("*")
    for (var i=0, len = allEle.length;i < len;i++)
    {
      if (allElementsArray.indexOf(allEle[i]) == -1)
      {
        allEle[i].index = current_index + incrementTemp;
        current_index = current_index + incrementTemp
        allElementsArray.push(allEle[i])
      } 
    }
  }
   
   
  // END
   
  // To capitalized 1st char
   
  function toTitleCase(str)
  {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
   
  function capitalize(s)
  {
      return s[0].toUpperCase() + s.slice(1);
  }
   
  // check if char is a number or not
  function isNumeric(value) {
      return !isNaN(String(value) * 1);
  };
   
  function exactMatchPattern(string) {
    if (string != null && (string.match(/^\w*:/) || string.indexOf('?') >= 0 || string.indexOf('*') >= 0)) {
      return "exact:" + string;
    } else {
      return string;
    }
  }
   
  // check if element is present on GUI or not
  findElement = function(locator, custom) 
  {
   
    if (locator == undefined)
      return null;
   
    try
    {
   
      if (custom.getElementById(locator))
          return custom.getElementById(locator)
   
      if (custom.getElementsByName(locator).length > 0 )
          return custom.getElementsByName(locator)[0]
   
      if (custom.getElementsByClassName(locator).length > 0)
          return custom.getElementsByClassName(locator)[0]
   
      if (custom.querySelectorAll(locator).length > 0)
          return custom.querySelectorAll(locator)[0]
     
      if (locator.startsWith("/")|| locator.startsWith("("))
        {
          result = custom.evaluate(locator, custom, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; 
          return result;
        }
   
  }
  catch (error)
  {
      if (locator.startsWith("/") || locator.startsWith("("))
        {
          result = custom.evaluate(locator, custom, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; 
          return result;
        }
  }
      return null;
   
  };
   
   
   
  // Check for eqaulity for element reference
  elementEquals = function(e, locator,custom) {
    var fe = findElement(locator,custom);
    return (e == fe);
  };
   
   
  /*
  * Class methods
  */
   
   
  // Get all attribute values
  attributeValue = function(value) {
    if (value.indexOf("'") < 0) {
      return "'" + value + "'";
    } else if (value.indexOf('"') < 0) {
      return '"' + value + '"';
    } else {
      var result = 'concat(';
      var part = "";
      while (true) {
        var apos = value.indexOf("'");
        var quot = value.indexOf('"');
        if (apos < 0) {
          result += "'" + value + "'";
          break;
       } else if (quot < 0) {
          result += '"' + value + '"';
          break;
        } else if (quot < apos) {
          part = value.substring(0, apos);
          result += "'" + part + "'";
          value = value.substring(part.length);
        } else {
          part = value.substring(0, quot);
          result += '"' + part + '"';
          value = value.substring(part.length);
        }
        result += ',';
      }
      result += ')';
      return result;
    }
  };
   
  getNodeNbr = function(current)
  {
    if (current!=null && current.parentNode !=null)
    {
      var childNodes = current.parentNode.childNodes;
      var total = 0;
      var index = -1;
      for (var i = 0; i < childNodes.length; i++) {
        var child = childNodes[i];
        if (child.nodeName == current.nodeName) {
          if (child == current) {
            index = total;
          }
          total++;
        }
      }
      return index;
    }
    return null
  };
   
  xpathHtmlElement = function(name,custom) {
    if (custom.contentType == 'application/xhtml+xml') {
      // "x:" prefix is required when testing XHTML pages
      return "x:" + name;
    } else {
      return name;
    }
  };
   
  relativeXPathFromParent = function(current,custom) {
    var index = getNodeNbr(current);
    var currentPath = '/' + xpathHtmlElement(current.nodeName.toLowerCase(),custom);
    if (index > 0) {
      currentPath += '[' + (index + 1) + ']';
    }
    return currentPath;
  };
   
   
  getCSSSubPath = function(e,custom) {
    if (e !=null)
    {
      var css_attributes = ['id', 'name', 'class', 'type', 'alt', 'title', 'value'];
      for (var i = 0; i < css_attributes.length; i++) {
        var attr = css_attributes[i];
        var value = e.getAttribute(attr);
        if (value) {
          if (attr == 'id')
            return '#' + value;
          if (attr == 'class')
            return e.nodeName.toLowerCase() + '.' + value.replace(" ", ".").replace("..", ".");
          return e.nodeName.toLowerCase() + '[' + attr + '="' + value + '"]';
        }
      }
      if (getNodeNbr(e))
        return e.nodeName.toLowerCase() + ':nth-of-type(' + getNodeNbr(e) + ')';
      else
        return e.nodeName.toLowerCase();
  }
  return null
  };
   
   
  findDomFormLocator = function(form,custom) {
    if (form.hasAttribute('name')) {
      var name = form.getAttribute('name');
      var locator = "document." + name;
      if (findElement(locator,custom) == form) {
        return locator;
      }
      locator = "document.forms['" + name + "']";
      if (findElement(locator,custom) == form) {
        return locator;
      }
    }
    var forms = custom.forms;
    for (var i = 0; i < forms.length; i++) {
      if (form == forms[i]) {
        return "document.forms[" + i + "]";
      }
    }
    return null;
  };
   
  preciseXPath = function(xpath, e,custom){
    //only create more precise xpath if needed
    if (findElement(xpath,custom) != e) {
      var result = custom.evaluate(xpath, custom, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      //skip first element (result:0 xpath index:1)
      for (var i=0, len=result.snapshotLength; i < len; i++) {
        var newPath = '(' +  xpath + ')[' + (i +1 )+']';
        if (findElement(newPath,custom) == e ) {
            return newPath ;
        }
      }
    }
    return xpath;
  }
   
   
  //
  byId = function(e,custom) {
    if (e !=null)
    {
        if (e.id && !isNumeric(e.id.slice(-1)) && !isNumeric(e.id.charAt(0)) && !((e.id.match(/\d/g) || []).length > 2) && (e == findElement("//*[@id='" + e.id + "']" , custom)))
        {
          return e.id;
        }
   
    } 
    return null;
  };
   
  byLink = function(e) {
    if (e|=null)
    {
        if (e.nodeName == 'A')
         {
            var text = e.textContent;
            if (!text.match(/^\s*$/))
            {
              return "link=" + exactMatchPattern(text.replace(/\xA0/g, " ").replace(/^\s*(.*?)\s*$/, "$1"));
            }
          }
    }
    return null;
  };
   
  byName = function(e,custom)
  {
      if(e !=null)
      {
        if (e.name && !isNumeric(e.name.slice(-1))  && !isNumeric(e.name.charAt(0)) && !((e.name.match(/\d/g) || []).length > 2) && (e == findElement("//*[@name='" + e.name + "']",custom)))
        {
          return e.name;
        }
      } 
    return null;
  };
   
  byCss = function(e,custom) {
    if(e!=null && e != undefined )
    {
        var current = e;
        var sub_path = getCSSSubPath(e);
        while ( current != null && findElement("" + sub_path , custom) != e && current.nodeName.toLowerCase() != 'html') {
          sub_path = getCSSSubPath(current.parentNode) + ' > ' + sub_path;
          current = current.parentNode;
        }
        //return "css=" + sub_path;
        return sub_path;
    }
    return null; 
  };
   
   
  byXpathLink = function(e,custom)
  {
    if (e!=null)
    {
      if (e.nodeName == 'A') {
        var text = e.textContent;
        if (!text.match(/^\s*$/)) {
          return preciseXPath("//" + xpathHtmlElement("a",custom) + "[contains(text(),'" + text.replace(/^\s+/, '').replace(/\s+$/, '') + "')]", e,custom);
        }
      }   
    }
    return null;
  };
   
  byXpathImg =  function(e,custom)
    {
      if(e !=null)
      {
          if (e.nodeName == 'IMG') {
            if (e.alt != '') {
              return preciseXPath("//" + xpathHtmlElement("img",custom) + "[@alt=" + attributeValue(e.alt) + "]", e,custom);
            } else if (e.title != '') {
              return preciseXPath("//" + xpathHtmlElement("img",custom) + "[@title=" + attributeValue(e.title) + "]", e,custom);
            } else if (e.src != '') {
              return preciseXPath("//" + xpathHtmlElement("img",custom) + "[contains(@src," + attributeValue(e.src) + ")]", e,custom);
            }
          }
      }
      return null;
    };
   
  byXpathAttributes =  function(e,custom)
  {
      if (e!=null)
      {
            PREFERRED_ATTRIBUTES1 = ['id', 'name', 'value', 'type', 'action', 'onclick','data-for','aria-owns','ng-click','class'];
            PREFERRED_ATTRIBUTES_ANGULAR = ['ng-app','ng-controller','ng-href','ng-src','ng-srcset','ng-model','ng-open','ng-show','ng-bind','ng-bind-template','ng-bind-html','ng-change','ng-class','ng-dblclick','ng-mousedown','ng-mouseup','ng-mouseover','ng-mouseenter','ng-mouseleave','ng-mousemove','ng-keydown','ng-keyup','ng-keypress','ng-submit','ng-focus','ng-blur','ng-copy','ng-cut','ng-paste','ng-if','ng-include','ng-init','ng-options','ng-repeat','ng-show','ng-hide','ng-style','ng-switch','ng-pattern']
   
            var PREFERRED_ATTRIBUTES = PREFERRED_ATTRIBUTES1.concat(PREFERRED_ATTRIBUTES_ANGULAR);
           
            var i = 0;
   
            function attributesXPath(elementNodeName, attNames, attributes,custom)
            {
              var locator = "//" + xpathHtmlElement(elementNodeName,custom) + "[";
              for (i = 0; i < attNames.length; i++) {
                if (i > 0) {
                  locator += " and ";
                }
                var attName = attNames[i];
                var t = attributeValue(attributes[attName])
                locator += '@' + attName + "=" + attributeValue(attributes[attName]);
              }
              locator += "]";
              return preciseXPath(locator, e,custom);
            }
   
            // Get all attribute of the element
            if (e.attributes) {
              var atts = e.attributes;
              var attsMap = {};
              for (i = 0; i < atts.length; i++) {
                var att = atts[i];
               
                // Code below is applicable for tr and table , i dont want to use class for this 2
                if ((att.value.length > 0 ) && !((att.value.toLowerCase().match(/\d/g) || []).length > 3)  &&  (att.value.toLowerCase() == 'ipv4' || att.value.toLowerCase() == 'ipv6' || !isNumeric(att.value.slice(-1)) && !isNumeric(att.value.charAt(0))) && e.tagName.toLowerCase() !='tr' && e.tagName.toLowerCase() !='table' && e.tagName.toLowerCase() !='td' && e.tagName.toLowerCase() !='th')
                  {
                    attsMap[att.name] = att.value;
                  }
              }
              var names = [];
              // try preferred attributes
              for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
                var name = PREFERRED_ATTRIBUTES[i];
                if (attsMap[name] != null && names.indexOf(name) == -1)
                {
                  names.push(name);
                  var locator = attributesXPath(e.nodeName.toLowerCase(), names, attsMap,custom);
                  if (e == findElement(locator,custom))
                  {
                    return locator;
                  }
                }
              }
            }
      }
    return null;
  };
   
  byXpathIdRelative =  function(e,custom)
  {

    var path = '';
    var current = e;
    while (current != null)
    {
      if (current.parentNode != null) {
        path = relativeXPathFromParent(current,custom) + path;
        if (1 == current.parentNode.nodeType && // ELEMENT_NODE
            current.parentNode.getAttribute("id")) {
          return preciseXPath("//" + xpathHtmlElement(current.parentNode.nodeName.toLowerCase(),custom) +
              "[@id=" + attributeValue(current.parentNode.getAttribute('id')) + "]" +
              path, e,custom);
        }
      } else {
        return null;
      }
      current = current.parentNode;
    }
    return null;
  };
   
  byXpathHref= function(e,custom)
  { 
    if (e!=null)
    {
      if (e.attributes && e.hasAttribute("href")) {
        href = e.getAttribute("href");
        if (href.search(/^http?:\/\//) >= 0) {
          return preciseXPath("//" + xpathHtmlElement("a",custom) + "[@href=" + attributeValue(href) + "]", e, custom);
        } else {
          // use contains(), because in IE getAttribute("href") will return absolute path
          return preciseXPath("//" + xpathHtmlElement("a",custom) + "[contains(@href, " + attributeValue(href) + ")]", e , custom);
        }
      }
    } 
    return null;
  };
   
  byDomIndex = function(e,custom)
  {
    if (e!=null)
    {
      if (e.form) {
        var formLocator = findDomFormLocator(e.form,custom);
        if (formLocator) {
          var elements = e.form.elements;
          for (var i = 0; i < elements.length; i++) {
            if (elements[i] == e) {
              return formLocator + ".elements[" + i + "]";
            }
          }
        }
      }   
    }
    return null;
  };
   
  byXpathPosition = function(e,custom) {
    var path = '';
    var current = e;
    while (current != null)
    {
      var currentPath;
      if (current.parentNode != null) {
        currentPath = relativeXPathFromParent(current,custom);
      } else {
        currentPath = '/' + xpathHtmlElement(current.nodeName.toLowerCase(),custom);
      }
      path = currentPath + path;
      var locator = '/' + path;
      if (e == findElement(locator,custom)) {
        return locator;
      }
      current = current.parentNode;
    }
    return null;
  };
   
   
   
  function findXpath(el,custom) {
    if (typeof el == "string") return custom.evaluate(el, custom, null, 0, null)
    if (!el || el.nodeType != 1) return ''
    if (el.id && (el.id.length > 0 ) &&  !isNumeric(el.id.slice(-1))  && !isNumeric(el.id.charAt(0)) && !((el.id.match(/\d/g) || []).length > 3) && (el == findElement("//*[@id='" + el.id + "']" , custom))) return "//*[@id='" + el.id + "']"
    if (el.name && (el.name.length > 0 ) && !isNumeric(el.name.slice(-1))  && !isNumeric(el.name.charAt(0)) && !((el.name.match(/\d/g) || []).length > 3) && (el == findElement("//*[@name='" + el.name + "']" , custom))) return "//*[@name='" + el.name + "']"
    if (byXpathAttributes(el,custom) !== null) return byXpathAttributes(el,custom)
    if (el.parentNode !=null)
      var sames = [].filter.call(el.parentNode.children, function (x) { return x.tagName == el.tagName })
    else
      var sames = []
    return findXpath(el.parentNode,custom) + '/' + el.tagName.toLowerCase() + (sames.length > 1 ? '['+([].indexOf.call(sames, el)+1)+']' : '')
  }
   
   
  function findXpathBackUp(el,custom) {
    if (typeof el == "string") return custom.evaluate(el, custom, null, 0, null)
    if (!el || el.nodeType != 1) return ''
    if (el.id && (el.id.length > 0 ) &&  !isNumeric(el.id.slice(-1))  && !((el.id.match(/\d/g) || []).length > 3) && (el == findElement("//*[@id='" + el.id + "']", custom))) return "//*[@id='" + el.id + "']"
    if (el.name && (el.name.length > 0 ) && !isNumeric(el.name.slice(-1))  && !((el.name.match(/\d/g) || []).length > 3) && (el == findElement("//*[@name='" + el.name + "']" , custom))) return "//*[@name='" + el.name + "']"
    if (byXpathAttributes(el,custom) !== null) return byXpathAttributes(el,custom)
    if (el.parentNode !=null)
      var sames = [].filter.call(el.parentNode.children, function (x) { return x.tagName == el.tagName })
    else
      var sames = []
    return findXpath(el.parentNode,custom) + '/' + el.tagName.toLowerCase() + (sames.length > 1 ? '['+([].indexOf.call(sames, el)+1)+']' : '')
  }
   
   
  function checkForAttribute(el,custom) {
    PREFERRED_ATTRIBUTES1 = ['id', 'name', 'value', 'type', 'action', 'onclick','data-for','aria-owns','ng-click'];
    PREFERRED_ATTRIBUTES_ANGULAR = ['ng-app','ng-controller','ng-href','ng-src','ng-srcset','ng-model','ng-open','ng-show','ng-bind','ng-bind-template','ng-bind-html','ng-change','ng-class','ng-dblclick','ng-mousedown','ng-mouseup','ng-mouseover','ng-mouseenter','ng-mouseleave','ng-mousemove','ng-keydown','ng-keyup','ng-keypress','ng-submit','ng-focus','ng-blur','ng-copy','ng-cut','ng-paste','ng-if','ng-include','ng-init','ng-options','ng-repeat','ng-show','ng-hide','ng-style','ng-switch','ng-pattern']
    var PREFERRED_ATTRIBUTES = PREFERRED_ATTRIBUTES1.concat(PREFERRED_ATTRIBUTES_ANGULAR);
   
    for (var i = 0; i < PREFERRED_ATTRIBUTES.length; i++)
    {
      var attr = PREFERRED_ATTRIBUTES[i];
      val = identifier(elementToIndentify)
      if (val !== null)
      {
        hash[identifier.name]= val;
      }
    }
   
    if (typeof el == "string") return custom.evaluate(el, custom, null, 0, null)
    if (!el || el.nodeType != 1) return ''
    if (el.id && !isNumeric(el.id.slice(-1))) return "//*[@id='" + el.id + "']"
    if (el.name && !isNumeric(el.name.slice(-1))) return "//*[@name='" + el.name + "']"
    if (byXpathAttributes(el,custom) !== null) return byXpathAttributes(el,custom)
   
    var sames = [].filter.call(el.parentNode.children, function (x) { return x.tagName == el.tagName })
    return findXpath(el.parentNode,custom) + '/' + el.tagName.toLowerCase() + (sames.length > 1 ? '['+([].indexOf.call(sames, el)+1)+']' : '')
  }
   
   
  function byXpathUsingContainsBackUp(el,custom) {
    locator = "//" + el.tagName.toLowerCase() +"[contains(.,'" + el.innerText.trim() + "')]"
    if (el == findElement(locator,custom)) {
      return locator;
    }
    return null;
  }

function getNearestTableAncestor(htmlElementNode) {
    while (htmlElementNode) {
        htmlElementNode = htmlElementNode.parentNode;
        if (htmlElementNode.tagName.toLowerCase() === 'table') {
            return htmlElementNode;
        }
    }
    return undefined;
}


  function byXpathUsingContains(el,custom) {
    if (el.nodeName.toLowerCase() == "td")
    {
      parentTable = getNearestTableAncestor(el)
      locatorForTable = byXpath(parentTable,custom)
      tdPosition = relativeXPathFromParent(el,custom)
      sessionStorage.textToLookFor = ""
      sessionStorage.UsingbyXpathUsingContains = "true"
      var xpathText = ""
      for(var i=0;i<el.parentNode.childElementCount;i++)
      {
        if(el.parentNode.children[i].innerText.trim().length > 0)
        {
          xpathText = xpathText + "contains(.,'"+el.parentNode.children[i].innerText.trim()+"')"    
          sessionStorage.textToLookFor = sessionStorage.textToLookFor + el.parentNode.children[i].innerText.trim() + "  "      
          finalLocator =  locatorForTable  +  "//" + el.parentNode.nodeName.toLowerCase() +"["+ xpathText +"]" + tdPosition
          var temp = locatorForTable  +  "//" + el.parentNode.nodeName.toLowerCase() +"[IDENTIFIER]" + tdPosition
          sessionStorage.locatorNameContain = temp
          if(el == findElement(finalLocator,custom)) return finalLocator
          //if(el == findElement(finalLocator,custom)) return temp
          if(i<el.parentNode.childElementCount -1)
            xpathText = xpathText + " and "
        }
      }
      //finalLocator = preciseXPath(finalLocator,el,custom)
      //if(el == findElement(finalLocator,custom)) return finalLocator
    }
 
    else if (el.nodeName.toLowerCase() == "tr")
    {
      parentTable = getNearestTableAncestor(el)
      locatorForTable = byXpath(parentTable,custom)
      sessionStorage.textToLookFor = ""
      sessionStorage.UsingbyXpathUsingContains = "true"

      var xpathText = ""
      for(var i=0;i<el.childElementCount;i++)
      {
        if(el.children[i].innerText.trim().length > 0)
        {
      sessionStorage.textToLookFor = sessionStorage.textToLookFor +  el.children[i].innerText.trim() + "  " 
      xpathText = xpathText + "contains(.,'"+el.children[i].innerText.trim()+"')" 
      finalLocator =  locatorForTable  +  "//" + el.nodeName.toLowerCase() +"["+ xpathText +"]" 
      var temp = locatorForTable  +  "//" + el.nodeName.toLowerCase() + "[IDENTIFIER]"
      sessionStorage.locatorNameContain = temp
      if(el == findElement(finalLocator,custom)) return finalLocator
      //if(el == findElement(finalLocator,custom)) return temp
      if(i<el.childElementCount -1)
        xpathText = xpathText + " and "
  
        }
      }
      //finalLocator = preciseXPath(finalLocator,el,custom)
      //if(el == findElement(finalLocator,custom)) return finalLocator
    }

    else if (el.parentNode && el.parentNode.nodeName.toLowerCase() == "td" && el.nodeName.toLowerCase() != "a")
    {
      parentTable = getNearestTableAncestor(el.parentNode)
      locatorForTable = byXpath(parentTable,custom)
      trPosition = relativeXPathFromParent(el.parentNode.parentNode,custom)
      tdPosition = relativeXPathFromParent(el.parentNode,custom)
      sessionStorage.textToLookFor = ""
      sessionStorage.UsingbyXpathUsingContains = "true"      
      if(el.innerText && el.innerText.length > 0)
      {
        var xpathText = ""
        for(var i=0;i<el.parentNode.parentNode.childElementCount;i++)
        {
          if(el.parentNode.parentNode.children[i].innerText.trim().length > 0)
          {
            sessionStorage.textToLookFor = sessionStorage.textToLookFor  + el.parentNode.parentNode.children[i].innerText.trim() + "  "
            xpathText = xpathText + "contains(.,'"+el.parentNode.parentNode.children[i].innerText.trim()+"')"
            finalLocator =  locatorForTable  +  "//" + el.parentNode.parentNode.nodeName.toLowerCase() + "["+ xpathText +"]" + tdPosition + "/" + el.nodeName.toLowerCase()
            var temp = locatorForTable  +  "//" + el.parentNode.parentNode.nodeName.toLowerCase() + "[IDENTIFIER]" + tdPosition + "/" + el.nodeName.toLowerCase()
            sessionStorage.locatorNameContain = temp
            if(el == findElement(finalLocator,custom)) return finalLocator
            //if(el == findElement(finalLocator,custom)) return temp
            if(i<el.parentNode.parentNode.childElementCount -1)
              xpathText = xpathText + " and "
          }
        }
      }      
      //finalLocator = preciseXPath(finalLocator,el,custom)
      //if(el == findElement(finalLocator,custom)) return finalLocator
    }

    else
    {
    sessionStorage.textToLookFor = ""
    sessionStorage.textToLookFor = sessionStorage.textToLookFor + el.innerText.trim() 
    locator = "//" + el.tagName.toLowerCase() +"[contains(.,'" + el.innerText.trim() + "')]" 
    var temp = "//" + el.tagName.toLowerCase() + "[IDENTIFIER]"
    sessionStorage.locatorNameContain = temp 

    //locator = preciseXPath(locator,el,custom)
      if (el == findElement(locator,custom)) return locator;
      //if (el == findElement(locator,custom)) return temp;
    }
    
    return null;
  }


   
 function byXpath(element,custom) 
  {
    xpath = findXpath(element,custom)
    console.log(xpath)
    if (xpath.indexOf("/html/body/table/tbody") !== -1)
      xpath = xpath.replace("/html/body/table/tbody", "/");
    if (xpath.indexOf("/html/body/main") !== -1)
      xpath = xpath.replace("/html/body/main", "/");
    if (xpath.indexOf("/html/body") !== -1)
      xpath = xpath.replace("/html/body", "/");
    if (xpath.indexOf("/table/tbody") !== -1)
      xpath = xpath.replace("table/tbody", "");
   
    if (element == findElement(xpath,custom)) {
      return xpath;
    }
    return null;
   
  }  
   
  function highlight(element) {
      var div = highlight.div; // only highlight one element per page
   
      if(element === null) { // remove highlight via `highlight(null)`
          if(div.parentNode) div.parentNode.removeChild(div);
          return;
      }
   
      var width = element.offsetWidth,
          height = element.offsetHeight;
   
      div.style.width = width + 'px';
      div.style.height = height + 'px';
   
      element.offsetParent.appendChild(div);
   
      div.style.left = element.offsetLeft + (width - div.offsetWidth) / 2 + 'px';
      div.style.top = element.offsetTop + (height - div.offsetHeight) / 2 + 'px';
  }
   
  highlight.div = document.createElement('div');
   
  // set highlight styles
  with(highlight.div.style) {
      position = 'absolute';
      border = '5px solid red';
  }
   
  function findAllPossibleLocator(elementToIndentify,custom)
  {
    var hash = new Object();
    var identifiers = [byId, byName, byXpathAttributes, byXpath, byXpathHref, byXpathIdRelative, byXpathImg, byXpathLink,byXpathUsingContains];
   
    for (var i = 0; i < identifiers.length; i++)
    {
      var identifier = identifiers[i];
      val = identifier(elementToIndentify,custom)
      if (val !== null)
      {
        hash[identifier.name]= val;
      }
    }
    return hash
  }
   
   
  function printHTMLHeaderForManual()
  {
    htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Element IDs</title>"+
    "<style>"+
    "table{"+
    "border-collapse:"+
    "collapse;border: 5px solid black;"+
    "width: 100%;"+
    "}"+
    "td{"+
    "width: 25%;height: 2em;border: 2px solid black;"+
    "}"+
    "th{"+
    "width: 25%;height: 2em;border: 2px solid black;"+
    "}"+
    "button {"+
    "background-color: #555555; /* Green */" +
    "border: 1;" +
    "color: white;"+
    "padding: 15px 32px;"+
    "text-align: center;"+
    "text-decoration: none;"+
    "display: inline-block;"+
    "font-size: 13px;"+
    "margin: 25px 40px;"+
    "}"+
    "tab { padding-left: 80em; }" +
    " table {"+
    "counter-reset: rowNumber -1;"+
    "}"+
    "table tr:not(:first-child){"+
    "counter-increment: rowNumber;"+
    "border-collapse: separate;" +
    "}"+
    "table tr td:first-child::before {"+
    "content: counter(rowNumber) \"  :  \";"+
    "min-width: 1em;"+
    "margin-right: 0.5em;"+
    "}"+ 
    "</style></head><body>";
    htmlTableHeader = "<table id='tableID'><tbody><tr><th colspan=4 align=center <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=6 color=&quot;#FF0000&quot;> <h2><font face=Verdana color=red>Generate Python Selenium Script in a Click</font></h2></th></tr>";
    htmlTableTrHeader= "<tr><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Name Of Identifier </font></th><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Identifier</font></th><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Selenium Command</font></th><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Screen Name</font></th></tr>" + 
    "<tr><td>url</td><td>NA</td><td>driver.get(data[\"url\"])</td><td>" + localStorage.url + " </td></tr>";

    var window_handle=openOnce('parentWindow', 'MyWindowName');

    // This code is for driver.get(url)
    
    //sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + "&nbsp;&nbsp;&nbsp;&nbsp;" + "url: \""+ window.location.href +"\"</br>"
    //sessionStorage.functionContentManual = sessionStorage.functionContentManual+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "#driver.get(data[\"url\"])" + "</br></br>"



    return window_handle
  }


  function printHTMLHeader()
  {
    htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Element IDs</title>"+
    "<style>"+
    "table{"+
    "border-collapse:"+
    "collapse;border: 5px solid black;"+
    "width: 100%;"+
    "}"+
    "td{"+
    "width: 25%;height: 2em;border: 2px solid black;"+
    "}"+
    "th{"+
    "width: 25%;height: 2em;border: 2px solid black;"+
    "}"+
    "button {"+
    "background-color: #555555; /* Green */" +
    "border: 1;" +
    "color: white;"+
    "padding: 15px 32px;"+
    "text-align: center;"+
    "text-decoration: none;"+
    "display: inline-block;"+
    "font-size: 13px;"+
    "margin: 25px 40px;"+
    "}"+
    "tab { padding-left: 80em; }" +
    " table {"+
    "counter-reset: rowNumber -1;"+
    "}"+
    "table tr:not(:first-child){"+
    "counter-increment: rowNumber;"+
    "border-collapse: separate;" +
    "}"+
    "table tr td:first-child::before {"+
    "content: counter(rowNumber) \"  :  \";"+
    "min-width: 1em;"+
    "margin-right: 0.5em;"+
    "}"+ 
    "</style></head><body>";
    htmlTableHeader = "<table id='tableID'><tbody><tr><th colspan=4 align=center <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=6 color=&quot;#FF0000&quot;> <h2><font face=Verdana color=red>Generate Python Selenium Script in a Click</font></h2></th></tr>";
    htmlTableTrHeader= "<tr><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Name Of Identifier </font></th><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Identifier</font></th><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Selenium Command</font></th><th <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=4 color=&quot;#FF0000&quot;> <font face=Verdana color=grey>Screen Name</font></th></tr>";
    var window_handle=window.open("parentWindow","com_MyDomain_myWindowForThisPurpose");
    window_handle.document.open();
    window_handle.document.write(htmlBody)
    window_handle.document.write(htmlTableHeader)
    window_handle.document.write(htmlTableTrHeader)
    return window_handle
  }

  function openOnce(url, target){
      // open a blank "target" window
      // or get the reference to the existing "target" window
      //var winref = window.open('', target, '', true);
    var winref = window.open('', target); 

      // if the "target" window was just opened, change its url
      if(winref.location.href === 'about:blank'){
        // initialised for all variable for 1st time 

        sessionStorage.functionContentManual = ""
        sessionStorage.verifyFunctionContentManual = ""     
        sessionStorage.dataDocumentContentManual = ""
        //sessionStorage.specDocumentContentForManual = ""
        sessionStorage.locatorDocumentContent = ""
          winref.location.href = url;
        winref.document.write(htmlBody)
        winref.document.write(htmlTableHeader)
        winref.document.write(htmlTableTrHeader)
        printHTMLFooter(winref)

      // Add click event to buttons

        winref.document.getElementById("downloadData").removeEventListener("click", printDataFileForManual);
        winref.document.getElementById("downloadScript").removeEventListener("click", printScriptManual);
        winref.document.getElementById("downloadSpec").removeEventListener("click", printSpecFileForManual);
        winref.document.getElementById("downloadLocator").removeEventListener("click", printLocator);
        winref.document.getElementById("downloadJob").removeEventListener("click", printJob);
        winref.document.getElementById("downloadLib").removeEventListener("click", printLib);
        winref.document.getElementById("downloadServerDetail").removeEventListener("click", printLib);

        winref.document.getElementById("downloadData").addEventListener("click", printDataFileForManual);
        winref.document.getElementById("downloadScript").addEventListener("click", printScriptManual);
        winref.document.getElementById("downloadSpec").addEventListener("click", printSpecFileForManual);
        winref.document.getElementById("downloadLocator").addEventListener("click", printLocator);
        winref.document.getElementById("downloadJob").addEventListener("click", printJob);
        winref.document.getElementById("downloadLib").addEventListener("click", printLib);
        winref.document.getElementById("downloadServerDetail").addEventListener("click", printServerDetails);

      }
      return winref;
  }


  function customizedLabel(lableValue)
  {
      //remove all special char
    lableValue = lableValue.replace(/[^a-zA-Z 0-9]/g, "")
 
    // Remove leading and trailing space
    lableValue = lableValue.trim()
 
    // Remove all white space
    lableValue = lableValue.replace(/  /g,'_')
    lableValue = lableValue.replace(/ /g,'_')
   
      //lableValue  = (sessionStorage.pageName +"_" +lableValue).toLowerCase()
    lableValue  = lableValue.toLowerCase()

    if(/^\d/.test(lableValue))
       lableValue = sessionStorage.pageName + lableValue

    return sessionStorage.pageName + "_" + lableValue

  }

  function updateLabelName(lableValue,locatorValue)
  {

    var elementIDsLocatorMap = new Object();;

    if(sessionStorage.elementIDsLocatorMap)
      var elementIDsLocatorMap = JSON.parse(sessionStorage.elementIDsLocatorMap);
    
    if(lableValue in elementIDsLocatorMap){
      while(true){
        if(lableValue in elementIDsLocatorMap){
          var numb = lableValue.match(/\d/g);
          if(numb !=null){
            numb = numb.join("");
            lableValue = lableValue.replace(numb,"")      
            numb = Number(numb) + 1
            lableValue = lableValue+numb
          }
          else
          {
            numb = 1
            lableValue = lableValue+numb
          }
        }
        else
          break
      }//while
    }
    elementIDsLocatorMap[lableValue] = locatorValue
    sessionStorage.elementIDsLocatorMap = JSON.stringify(elementIDsLocatorMap);
    return lableValue
  }
function printHTMLBodyAlert(lableValue,message)
{
      var table = window_handle.document.getElementById("tableID");
      var row = table.insertRow ((table.rows.length -1 ));
      var cell = row.insertCell (0);
      cell.innerHTML = lableValue;
      var cell = row.insertCell (1);
      cell.innerHTML = message
      var cell = row.insertCell (2);
      cell.innerHTML = "alert.accept()"
      var cell = row.insertCell (3);
      cell.innerHTML = currentPageAddress;
}

function printHTMLBodyConfirm(lableValue,message,flag)
{
      var table = window_handle.document.getElementById("tableID");
      var row = table.insertRow ((table.rows.length -1 ));
      var cell = row.insertCell (0);
      cell.innerHTML = lableValue;
      var cell = row.insertCell (1);
      cell.innerHTML = message
      var cell = row.insertCell (2);
      if(flag == "true") 
        cell.innerHTML = "alert.accept()"
      else
        cell.innerHTML = "alert.dismiss()"
      var cell = row.insertCell (3);
      cell.innerHTML = currentPageAddress;
}

  function printHTMLBody(window_handle,elementIDs,currentElementEventType,actualEle,custom)
  {
    for (var ids in elementIDs)
    {
   
      lableValue  = generateLocatorNameHelper(elementIDs[ids],custom.view.document)
      console.log("lableValue : " , lableValue)
      if (lableValue == null || lableValue.trim().length == 0)
      {
        lableValue = "NotAbleToIdentify"
      }

      lableValue = customizedLabel(lableValue)
      lableValue = updateLabelName(lableValue,elementIDs[ids])

      var table = window_handle.document.getElementById("tableID");
      var row = table.insertRow ((table.rows.length -1 ));

      var cell = row.insertCell (0);
      cell.innerHTML = lableValue;
      var cell = row.insertCell (1);
      cell.innerHTML = elementIDs[ids];
      var cell = row.insertCell (2);

      cell.innerHTML = seleniumCommandHelper(ids,lableValue,currentElementEventType,custom.view.document);
      var cell = row.insertCell (3);
      cell.innerHTML = currentPageAddress;


      //elementNode = nodeName.toLowerCase()
      t = [lableValue, elementIDs[ids],ids,actualEle]
      collectInfo.push(t)


      // maintain a hash for element in which screen / page
      idElementAnil = elementIDs[ids]

      //mantainElementWithPageNameArray.push({idElementAnil,pageName })
      var modifiedLocator  = elementIDs[ids]
      sessionStorage.currentElementLabel = lableValue
      sessionStorage.currentElementlocator = elementIDs[ids]

      //added this code for   "//button[@ng-click="saveLicense('activate')"]"  issue 
      modifiedLocator = modifiedLocator.replace(/"/g, '\\"');

      // For table row / column identificatin using identifier 
      if(ids == "byXpathUsingContains" &&  sessionStorage.UsingbyXpathUsingContains  && sessionStorage.UsingbyXpathUsingContains == "true")
      {
          sessionStorage.locatorDocumentContent = sessionStorage.locatorDocumentContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "self."+lableValue+ " = \""+sessionStorage.locatorNameContain+"\"</br>"
      }
      else
      {
          sessionStorage.locatorDocumentContent = sessionStorage.locatorDocumentContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "self."+lableValue+ " = \""+modifiedLocator+"\"</br>"  
      }  
      generateOperationScriptForManual(lableValue,elementIDs[ids],ids,actualEle,custom)
      generateDataFileForManual(lableValue,actualEle)    
      
      if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
        sessionStorage.setLoop = "continue"
   
  }
}


  function updateHTMLBody(window_handle,elementIDs,currentElementEventType,actualEle,custom)
  {
    //console.log("currentElementEventType : " , currentElementEventType)
    for (var ids in elementIDs)
    {
    
      lableValue  = sessionStorage.currentElementLabel
      
      var table = window_handle.document.getElementById("tableID");
      var row = table.deleteRow ((table.rows.length -2 ));        
  

      updateTabValue()
      if(sessionStorage.setRecordVerify && sessionStorage.setRecordVerify == "true")
      {
        
        // Update the element status so delete the last entry and add the new entry for Verify 
        var temp = tab +generateWaitCommandHelperVerify(ids,lableValue) +tab2 + "if \"" +lableValue + "\" in data:" + "</br>" + tab3 + seleniumCommandHelper(ids,lableValue,previousElementEventType) + "</br></br>"
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual.replace(temp,"")
        
        var scriptVerify = helperForVerification(ids,lableValue,actualEle)
        var temp = tab +generateWaitCommandHelperVerify(ids,lableValue) + tab2 + "if \"" + lableValue + "\" in data:" + "</br>" +  tab3 + scriptVerify + "</br></br>"
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual.replace(temp,"")

        var table = window_handle.document.getElementById("tableID");
        var row = table.insertRow ((table.rows.length -1 ));

        var cell = row.insertCell (0);
        cell.innerHTML = lableValue;
        var cell = row.insertCell (1);
        cell.innerHTML = elementIDs[ids];
        var cell = row.insertCell (2);
        cell.innerHTML = "Verification Code"
        var cell = row.insertCell (3);
        cell.innerHTML = currentPageAddress;

        generateVerificationScriptForManual(lableValue,elementIDs[ids],ids,currentElement,"false",custom)
        //sessionStorage.currentElementLabel = lableValue
      }     
      else
      {

        // Update the element status so delete the last entry and add the new entry for Operation
        var temp =tab + generateWaitCommandHelper(ids,lableValue) + tab2 + "if \"" +lableValue + "\" in data:" + "</br>" + tab3 + seleniumCommandHelper(ids,lableValue,previousElementEventType) + "</br></br>"
        sessionStorage.functionContentManual = sessionStorage.functionContentManual.replace(temp,"")

          // for Select which have attribute like aria-owns
        if(actualEle.hasAttribute("aria-owns"))
        {
            var temp =  tab3 + "driver.find_element_by_xpath(\"//li[contains(.,'\" + data['" + lableValue + "']+\"')]\").click()" + "</br></br>"
            sessionStorage.functionContentManual = sessionStorage.functionContentManual.replace(temp,"")
        }

        if(actualEle.nodeName.toLowerCase().indexOf("select") != -1)
        {
            var temp = tab3 + "driver.find_element_by_xpath(\"//option[contains(.,'\" + data['" + lableValue + "']+\"')]\").click()" + "</br></br>"
            sessionStorage.functionContentManual = sessionStorage.functionContentManual.replace(temp,"")
        }

        var table = window_handle.document.getElementById("tableID");
        var row = table.insertRow ((table.rows.length -1 ));

        var cell = row.insertCell (0);
        cell.innerHTML = lableValue;
        var cell = row.insertCell (1);
        cell.innerHTML = elementIDs[ids];
        var cell = row.insertCell (2);
        cell.innerHTML = seleniumCommandHelper(ids,lableValue,currentElementEventType,custom.view.document);
        var cell = row.insertCell (3);
        cell.innerHTML = currentPageAddress;

        generateOperationScriptForManual(lableValue,elementIDs[ids],ids,currentElement,custom)
        //sessionStorage.currentElementLabel = lableValue

      }
      
      if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
        sessionStorage.setLoop = "continue"
    }
}

function isElementInList(lableValue, locatorName)
{
  var elementIDsLocatorMap = new Object();
  if(sessionStorage.elementIDsLocatorMap)
    var elementIDsLocatorMap = JSON.parse(sessionStorage.elementIDsLocatorMap);
  var labelList = new Array()
  if(lableValue in elementIDsLocatorMap)
  {
    while(true){
      if(lableValue in elementIDsLocatorMap)
      {
        labelList.push(lableValue)
        var numb = lableValue.match(/\d/g);
        if(numb !=null){
          numb = numb.join("");
          lableValue = lableValue.replace(numb,"")      
          numb = Number(numb) + 1
          lableValue = lableValue+numb
        }
        else
        {
          numb = 1
          lableValue = lableValue+numb
        }
      }
      else
      {
        break
      }
    }//while
  }

for(var i=0;i<labelList.length;i++)
{
  if(elementIDsLocatorMap[labelList[i]] == locatorName )
    return true
}

return false
}

function getElementFromList(lableValue, locatorName)
{
  var elementIDsLocatorMap = new Object();
  if(sessionStorage.elementIDsLocatorMap)
    var elementIDsLocatorMap = JSON.parse(sessionStorage.elementIDsLocatorMap);
  var labelList = new Array()
  if(lableValue in elementIDsLocatorMap)
  {
    while(true){
      if(lableValue in elementIDsLocatorMap)
      {
        labelList.push(lableValue)
        var numb = lableValue.match(/\d/g);
        if(numb !=null){
          numb = numb.join("");
          lableValue = lableValue.replace(numb,"")      
          numb = Number(numb) + 1
          lableValue = lableValue+numb
        }
        else
        {
          numb = 1
          lableValue = lableValue+numb
        }
      }
      else
      {
        break
      }
    }//while
  }

  for(var i=0;i<labelList.length;i++)
  {
    if(elementIDsLocatorMap[labelList[i]] == locatorName )
    {
      return labelList[i]
    }
  }
}

  function printHTMLBodyForManualVerification(window_handle,elementIDs,currentElementEventType,actualEle,custom)
  {
    for (var ids in elementIDs)
    {
      lableValue  = generateLocatorNameHelper(elementIDs[ids],custom.view.document)
      if (lableValue == null || lableValue.trim().length > 0)
      {
      lableValue = "NotAbleToIdentify"
      }

      lableValue = customizedLabel(lableValue)
      var oldElement = "false"

      if(isElementInList(lableValue, elementIDs[ids]))
        {
      oldElement = "true"
      lableValue = getElementFromList(lableValue, elementIDs[ids])
        }

      
      // For new Action during verification
      //console.log("oldElement : " , oldElement)
      if(oldElement == "false")
      {

          lableValue = updateLabelName(lableValue,elementIDs[ids])

        var table = window_handle.document.getElementById("tableID");
        var row = table.insertRow ((table.rows.length -1 ));

        var cell = row.insertCell (0);
        cell.innerHTML = lableValue;
        var cell = row.insertCell (1);
        cell.innerHTML = elementIDs[ids];
        var cell = row.insertCell (2);
        cell.innerHTML = seleniumCommandHelper(ids,lableValue,currentElementEventType,custom.view.document);
        var cell = row.insertCell (3);
        cell.innerHTML = currentPageAddress;

        sessionStorage.currentElementLabel = lableValue
        sessionStorage.currentElementlocator = elementIDs[ids]


        //added this code for   "//button[@ng-click="saveLicense('activate')"]"  issue 
        var modifiedLocator  = elementIDs[ids]
        modifiedLocator = modifiedLocator.replace(/"/g, '\\"');
       
        // For table row / column identificatin using identifier 
        if(ids == "byXpathUsingContains" &&  sessionStorage.UsingbyXpathUsingContains  && sessionStorage.UsingbyXpathUsingContains == "true")
        {
            sessionStorage.locatorDocumentContent = sessionStorage.locatorDocumentContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "self."+lableValue+ " = \""+sessionStorage.locatorNameContain+"\"</br>"
        }
        else
        {
            sessionStorage.locatorDocumentContent = sessionStorage.locatorDocumentContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "self."+lableValue+ " = \""+modifiedLocator+"\"</br>"
    
        }  

        //sessionStorage.locatorDocumentContent = sessionStorage.locatorDocumentContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "self."+lableValue+ " = \""+modifiedLocator+"\"</br>"

        generateVerificationScriptForManual(lableValue,elementIDs[ids],ids,actualEle,"true",custom)
      }
      else
      {
        var table = window_handle.document.getElementById("tableID");
        var row = table.insertRow ((table.rows.length -1 ));

        var cell = row.insertCell (0);
        cell.innerHTML = lableValue;
        var cell = row.insertCell (1);
        cell.innerHTML = elementIDs[ids];
        var cell = row.insertCell (2);
        //cell.innerHTML = seleniumCommandHelper(ids,lableValue,currentElementEventType,custom);
        cell.innerHTML = "Verification Code"
        var cell = row.insertCell (3);
        cell.innerHTML = currentPageAddress;

        //sessionStorage.currentElementLabel = "NotRequired"
        //sessionStorage.currentElementLabel = lableValue
        generateVerificationScriptForManual(lableValue,elementIDs[ids],ids,actualEle,"false",custom)
      }

      if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
        sessionStorage.setLoop = "continue"

    }
   
  }


  function printContextMenu(window_handle,elementIDs,actualEle,custom)
  {
    for (var ids in elementIDs)
    {
   
      lableValue  = generateLocatorNameHelper(elementIDs[ids],custom)
      if (lableValue == null || lableValue.trim().length > 0)
      {
        lableValue = "NotAbleToIdentify"
      }
    
      lableValue = customizedLabel(lableValue)
      //lableValue = updateLabelName(lableValue)

      var modifiedLocator  = elementIDs[ids]

      //added this code for   "//button[@ng-click="saveLicense('activate')"]"  issue 
      modifiedLocator = modifiedLocator.replace(/"/g, '\\"');
      
      //generateOperationScriptForManual(lableValue,elementIDs[ids],ids,actualEle)
      // Adding support for Verify logic in Operation 
    
      if (sessionStorage.setVerify == "true")
      {
          var scriptVerify = helperForVerification(ids,lableValue,actualEle)
          if (scriptVerify!=null && scriptVerify.length > 0 )
          { 

            var table = window_handle.document.getElementById("tableID");
            var row = table.insertRow ((table.rows.length -1 ));
           
            var cell = row.insertCell (0);
            cell.innerHTML = lableValue;
            var cell = row.insertCell (1);
            cell.innerHTML = elementIDs[ids];

            var cell = row.insertCell (2);
            cell.innerHTML = "Verify This";
            var temp = generateWaitCommandHelperVerify(ids,lableValue)
            temp = temp + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" + lableValue + "\" in data:" + "</br>"
            temp = temp + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + scriptVerify + "</br></br>"

            // Remove verify logic as user wants to verify on in operation itself
            sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual.replace(temp,"")

            var temp = generateWaitCommandHelperVerify(ids,lableValue)
            temp = temp + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" + lableValue + "\" in data:" + "</br>"
            temp = temp + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + seleniumCommandHelper(ids,lableValue,currentElementEventType) + "</br></br>"

            // Remove action logic as user wants to verify on in operation itself
            sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual.replace(temp,"")
          
            
            sessionStorage.functionContentManual = sessionStorage.functionContentManual + generateWaitCommandHelper(ids,lableValue)
            sessionStorage.functionContentManual = sessionStorage.functionContentManual+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" + lableValue + "\" in data:" + "</br>"
            sessionStorage.functionContentManual = sessionStorage.functionContentManual + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + scriptVerify + "</br></br>"
            var cell = row.insertCell (3);
            cell.innerHTML = currentPageAddress;
          } 
          sessionStorage.setVerify = "false"
      }

      // Adding support for Verify logic in Operation 
      if (sessionStorage.setTime5 == "true")
      {
           
          var table = window_handle.document.getElementById("tableID");
          var row = table.insertRow ((table.rows.length -1 ));

          var cell = row.insertCell (0);
          cell.innerHTML = lableValue;
          var cell = row.insertCell (1);
          cell.innerHTML = elementIDs[ids];
      
          var cell = row.insertCell (2);
          cell.innerHTML = "Time.Sleep(5)";        

          var cell = row.insertCell (3);
          cell.innerHTML = currentPageAddress;


          sessionStorage.functionContentManual = sessionStorage.functionContentManual+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "time.sleep(5)</br>"
          sessionStorage.setTime5 = "false"  
      } 

      if (sessionStorage.setTime10 == "true")
      {

          var table = window_handle.document.getElementById("tableID");
          var row = table.insertRow ((table.rows.length -1 ));

          var cell = row.insertCell (0);
          cell.innerHTML = lableValue;
          var cell = row.insertCell (1);
          cell.innerHTML = elementIDs[ids];
      
          var cell = row.insertCell (2);
          cell.innerHTML = "Time.Sleep(10)";        

          var cell = row.insertCell (3);
          cell.innerHTML = currentPageAddress;

          sessionStorage.functionContentManual = sessionStorage.functionContentManual+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "time.sleep(10)</br>"
          sessionStorage.setTime10 = "false"  
      } 

    }
  }
   
  function checkForCancelButton(a)
  {

    var locatorName = a[0]
    var locator = a[1]
    var identifier = a[2]
    var actualEle = a[3]
    temp = [locatorName , locator , identifier,actualEle]
    if(locatorName.indexOf("cancel") != -1)
      return temp
    return null

  } 

  function createFunction(a)
  { 
      var addFlag = false
      var operationFlag = false
      var verificationFlag = false
      var isLastOneIsHeader = false
      var groupFunction = []
      var add = new Array()
      var edit = new Array()
      var deleteF = new Array()
      var tableEdit = new Array()
      var tableDelete = new Array()
      var operation = new Array()
      var verification = new Array()
      for(var i=0;i<a.length;i++)
        {
   
          var locatorName = a[i][0]
          var locator = a[i][1]
          var identifier = a[i][2]
          var actualEle = a[i][3]
   
   
          if (locatorName.indexOf("network_summary") == -1 && locatorName.indexOf("notabletoidentify") == -1 && locatorName.indexOf("cancel") == -1 && locatorName.indexOf("close") == -1 )
          {
            // If this is a add locator , so need to create   a  new function
            if (locatorName.indexOf("_add_") != -1)
            {
                addFlag = true
                temp = [locatorName , locator, identifier ,actualEle]
                add.push(temp)
                if(operation.length> 0)
                  groupFunction.push(operation)
                operation = new Array()
                operationFlag = false              
            }

            if (locatorName.endsWith("_add"))
            {
                addFlag = true
                temp = [locatorName , locator, identifier ,actualEle]
                add.push(temp)
                if(operation.length> 0)
                  groupFunction.push(operation)
                operation = new Array()
                operationFlag = false              
            }
   
            else if (locatorName.toLowerCase().indexOf("_table_edit") != -1)
            {
                temp = [locatorName , locator,identifier,actualEle]
                tableEdit.push(temp)
                groupFunction.push(tableEdit)
                tableEdit = new Array()

            }

            else if (locatorName.toLowerCase().indexOf("_edit") != -1)
            {
                temp = [locatorName , locator,identifier,actualEle]
                edit.push(temp)
                groupFunction.push(edit)
                edit = new Array()

            }

            else if (locatorName.toLowerCase().indexOf("_table_delete") != -1)
            {
                temp = [locatorName , locator,identifier ,actualEle]
                tableDelete.push(temp)
                groupFunction.push(tableDelete)
                tableDelete = new Array()
                
            }
   
            else if (locatorName.toLowerCase().indexOf("_delete") != -1)
            {
                temp = [locatorName , locator,identifier ,actualEle]
                deleteF.push(temp)
                groupFunction.push(deleteF)
                deleteF = new Array()

            }
   
            else if (locatorName.toLowerCase().indexOf("_header") != -1 || locatorName.toLowerCase().indexOf("_table") != -1 )
            {
                temp = [locatorName , locator, identifier,actualEle]
                verificationFlag = true
                
                if (locatorName.toLowerCase().indexOf("_header") != -1 && !isLastOneIsHeader)
                {
                  //set the header to True
                  isLastOneIsHeader = true
                  verification.push(temp)

                }

                else if (locatorName.toLowerCase().indexOf("_header") != -1 && isLastOneIsHeader)
                {
                  isLastOneIsHeader = false
                  groupFunction.push(verification)
                  verification = new Array()
                }
   
                else if (locatorName.toLowerCase().indexOf("_table") != -1)
                {
                  verification.push(temp)
                  verificationFlag = false
                  isLastOneIsHeader = false                
                  groupFunction.push(verification)
                  verification = new Array()
                }

            }
   
            else if (locatorName.toLowerCase().indexOf("_apply") != -1)
            {
                temp = [locatorName , locator , identifier,actualEle]
                if (addFlag)
                {
                  groupFunction.push(add)
                  add.push(temp)
                  //var cancel_temp = checkForCancelButton(a[i+1])
                  //if(cancel_temp !=null)
                     //add.push(cancel_temp)
                  add = new Array()
                  addFlag = false
                }
                if(operationFlag)
                {
                  operation.push(temp)
                  groupFunction.push(operation)
                  operation = new Array()
                  operationFlag = false
                }
                   
            }
            else
            {
                temp = [locatorName , locator , identifier ,actualEle]
                if (addFlag)
                {
                  add.push(temp)
                }
                if (!addFlag)
                    operationFlag =true
   
                if(operationFlag)
                {
                  operation.push(temp)
                }
   
            }
   
        }
      }
   
      // Some incomplete scenario
      if (verificationFlag)
      {
          verificationFlag = false
          groupFunction.push(verification)
          verification = new Array()
       
      }
      if (addFlag)
      {
        groupFunction.push(add)
        add = new Array()
        addFlag = false
      }
      if(operationFlag)
      {
        groupFunction.push(operation)
        operation = new Array()
        operationFlag = false
      }
                   
    return groupFunction
  } 
   
  var FunctionAnil = new Array() 

  function generateFunction(a)
  {

    //var gFunWithData = new Array()
    var gFun = new Array();
    var editFlag  = false
    var editTemp = new Array()
    var addFlag  = false
    var addTemp = new Array()
    var editFunction = ""
    var deleteTemp = new Array()
    var Optemp = new Array()
    var dataAdd ;
    var dataEdit ;
    var data;


    for(var i=0;i<a.length;i++)
    {
      // for Delete 
      if(a[i][0].indexOf("table_delete_operation") != -1)
      {
        var deleteFunctionName = a[i][0]
        deleteTemp.push(deleteFunctionName)

        deleteFunctionName = deleteFunctionName.replace("_operation","")
        //deleteFunctionName = deleteFunctionName.replace("self." , "self.verify_")
        deleteFunctionName = "verify_" + deleteFunctionName
        deleteTemp.push(deleteFunctionName)
        data = a[i][1]
        gFun.push([3, deleteTemp, data])
        deleteTemp = new Array()
        
      } 
      if( a[i][0].indexOf("_edit_operation") != -1 || editFlag)
      {
        //edit 
        //operation add
        //edit
        //verify operation
        //verify table
        
        if(a[i][0].indexOf("_edit_operation") != -1)
        {
          var editFunctionName = a[i][0]
          editTemp.push(editFunctionName)
          editFunction = editFunctionName
          editFlag = true
        }


        if(a[i][0].indexOf("_add") != -1 && a[i][0].indexOf("_operation") != -1)
        {
          var addOperationFunction = a[i][0]
          editTemp.push(addOperationFunction)
          editTemp.push(editFunction)
          var addOperationFunctionVerify = addOperationFunction.replace("_operation","")
          //addOperationFunctionVerify = addOperationFunctionVerify.replace("self." , "self.verify_")
          addOperationFunctionVerify = "verify_" + addOperationFunctionVerify
          editTemp.push(addOperationFunctionVerify)
          dataEdit = a[i][1]
        }

        if(a[i][0].indexOf("_header") != -1 )
        {
          var verifyTableFunction = a[i][0]
          editTemp.push(verifyTableFunction)
          editFlag = false
          //gFun.push(editTemp)
          gFun.push([2, editTemp, dataEdit])
          editTemp = new Array()
        }
      }
      if(a[i][0].indexOf("_testing") != -1 || addFlag)
      {
        //add testing
        //operation add
        //edit
        //verify operation
        //verify table
        if(a[i][0].indexOf("_testing") != -1)
        {
          var addFunctionName = a[i][0]
          addTemp.push(addFunctionName)
          addFlag = true
        }

        if(a[i][0].indexOf("_add") != -1 && a[i][0].indexOf("_operation") != -1)
        {
          var addOperationFunction = a[i][0]
          addTemp.push(addOperationFunction)
          if (editFunction)
             addTemp.push(editFunction)
          var addOperationFunctionVerify = addOperationFunction.replace("_operation","")
          //addOperationFunctionVerify = addOperationFunctionVerify.replace("self." , "self.verify_") 
          addOperationFunctionVerify = "verify_" + addOperationFunctionVerify      
          addTemp.push(addOperationFunctionVerify)
          dataAdd = a[i][1]
        }

        if(a[i][0].indexOf("_header") != -1 )
        {
          var verifyTableFunction = a[i][0]
          addTemp.push(verifyTableFunction)
          //gFun.push(addTemp)
          gFun.push([1, addTemp, dataAdd])
          addTemp = new Array()
          addFlag = false
        }
      }
      if(a[i][0].indexOf("_operation") != -1 && !(a[i][0].indexOf("edit_operation") != -1) && !(a[i][0].indexOf("delete_operation") != -1) && !(a[i][0].indexOf("common_operation") != -1) )
       {
        var operationFunctionName = a[i][0]
        Optemp.push(operationFunctionName)
        data = a[i][1]
        operationFunctionName = operationFunctionName.replace("_operation","")
        //operationFunctionName = operationFunctionName.replace("self." , "self.verify_")    
        operationFunctionName = "verify_" + operationFunctionName   
        Optemp.push(operationFunctionName)
        //gFun.push(Optemp)
        gFun.push([1, Optemp, data])
        Optemp = new Array()
      }
    }

    if(addFlag)
      gFun.push([1, addTemp, dataAdd])

    if(editFlag)
      gFun.push([2, editTemp, dataEdit])

  // Sort the function like , add then edit then delete 
  gFun = gFun.sort(function(a1, b1){return a1[0] - b1[0]});
  return gFun
      
  }

  function generateScript()
  {
    scriptDocumentContent = ""
    verifyScriptDocumentContent = ""
    FunctionAnil = new Array()

      allFunctiionsArray = createFunction(collectInfo)
      if(allFunctiionsArray !=null && allFunctiionsArray.length > 0 )
      {
          for(var i=0;i<allFunctiionsArray.length;i++)
          {
            tempFunctionArray = allFunctiionsArray[i]
            functionName  = tempFunctionArray[0][0]
            if (functionName.indexOf("add") != -1 )
            {
              scriptDocumentContent  = scriptDocumentContent + generateAddScript(functionName, tempFunctionArray)
              verifyScriptDocumentContent = verifyScriptDocumentContent + generateVerificationScript(functionName, tempFunctionArray)
              // delete the 1st entry and pass it
              var tempA = [].concat(tempFunctionArray);
              tempA.splice(0,1)
              functionName = functionName+"_common"
              scriptDocumentContent  = scriptDocumentContent + generateOperationScript(functionName, tempA)    
            }
            else if (functionName.indexOf("table_delete") != -1 )
            {
              scriptDocumentContent  = scriptDocumentContent + generateTableDeleteScript(functionName, tempFunctionArray)
              verifyScriptDocumentContent  = verifyScriptDocumentContent + generateTableDeleteVerificationScript(functionName, tempFunctionArray)            
            }
            else if (functionName.indexOf("table_edit") != -1)
            {
              scriptDocumentContent  = scriptDocumentContent + generateTableEditScript(functionName, tempFunctionArray)
            }
            else if (functionName.indexOf("_table") != -1 || functionName.indexOf("_header") != -1)
            {
              verifyScriptDocumentContent  = verifyScriptDocumentContent + generateTableVerificationScript(functionName, tempFunctionArray)
            }
            else
            {
              scriptDocumentContent  = scriptDocumentContent + generateOperationScript(functionName, tempFunctionArray)
              verifyScriptDocumentContent = verifyScriptDocumentContent + generateVerificationScript(functionName, tempFunctionArray)
            }
          }
      }
  }

  function generateTableEditScript(functionName, tempFunctionArray)
  {
      var functionContent  = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def " +functionName + "_operation(self,driver,data):" + "</br>"
      var locatorName = tempFunctionArray[0][1]
      var searchElement  = "UNIQUE_IDENTIFIER"

      //var functionN = "self." + functionName + "_operation(driver,data)"
      var functionN = functionName + "_operation(driver,data)"
      
      FunctionAnil.push([functionN,tempFunctionArray])

      locatorName = locatorName.replace("//tr","//tr[contains(.,\"+ data['UNIQUE_IDENTIFIER' + \"])]")

      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      "self.assert_equal(\"True\",str(self.is_element_present(driver.find_element_by_xpath(\""+ locatorName + "\")) ," +
      "'Screen Name - " + sessionStorage.pageName + ", Entry for edit in table grid not found : ' + " + "data['" + searchElement + "']"+
      ",  'Screen Name - " +  sessionStorage.pageName +
      " Entry for edit in table grid Found : ' + data['" + searchElement + "'])"  + "</br></br>"

      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      "self.driver.find_element_by_xpath(\""+ locatorName + "\").click()"  + "</br></br>"

   
      return functionContent
  } 



  function generateTableDeleteVerificationScript(functionName, tempFunctionArray)
  {
   
      var functionContent  = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def verify_" +functionName + "(self,driver,data):" + "</br>"
      var locatorName = tempFunctionArray[0][1]
      var searchElement  = "UNIQUE_IDENTIFIER"

      //var functionN = "self.verify_" + functionName + "(driver,data)"
      var functionN = functionName + "(driver,data)"
      FunctionAnil.push([functionN,tempFunctionArray])


      locatorName = locatorName.replace("//tr","//tr[contains(.,\"+ data['UNIQUE_IDENTIFIER' + \"])]")

      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      "self.assert_equal(\"False\",str(self.is_element_present(driver.find_element_by_xpath(\""+ locatorName + "\")) ," +
      "'Screen Name - " + sessionStorage.pageName + ", Deletded Entry found in table grid : ' + " + "data['" + searchElement + "']"+
      ",  'Screen Name - " +  sessionStorage.pageName +
      " Deletded Entry not found in table grid : ' + data['" + searchElement + "'])"  + "</br></br>"
   
      functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"****** Verification for Deleted entry on table grid Completed *****\")" + "</br></br>"
      return functionContent
  } 

  function generateTableDeleteScript(functionName, tempFunctionArray)
  {
   
      var functionContent  = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def " +functionName + "_operation(self,driver,data):" + "</br>"
      var locatorName = tempFunctionArray[0][1]
      var searchElement  = "UNIQUE_IDENTIFIER"

      //var functionN = "self." + functionName + "_operation(driver,data)"
      var functionN = functionName + "_operation(driver,data)"
      
      FunctionAnil.push([functionN,tempFunctionArray])


      locatorName = locatorName.replace("//tr","//tr[contains(.,\"+ data['UNIQUE_IDENTIFIER' + \"])]")

      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      "self.assert_equal(\"True\",str(self.is_element_present(driver.find_element_by_xpath(\""+ locatorName + "\")) ," +
      "'Screen Name - " + sessionStorage.pageName + ", Entry for delete in table grid not found : ' + " + "data['" + searchElement + "']"+
      ",  'Screen Name - " +  sessionStorage.pageName +
      " Entry for delete in table grid Found : ' + data['" + searchElement + "'])"  + "</br></br>"

      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      "self.driver.find_element_by_xpath(\""+ locatorName + "\").click()"  + "</br>"

      var lableValue = updateLabelName("message","message")

      // Generate Alert code
      functionContent = functionContent + generateAlertCode(lableValue)
      functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"****** Deleted entry on table grid Completed *****\")" + "</br>"
      return functionContent
  } 

  function generateFrameSwitchCode(frameName)
  {
      var functionContent=""
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.default_content()"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.frame(\"" + frameName + "\")"  + "</br>"
      return functionContent

  }

  function generateAlertCode(labelName)
  {
      var functionContent= ""
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert = driver.switch_to_alert()"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert_message = alert.text"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"log.info(alert_message)"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"self.assert_equal(data[\""+labelName+"\"], alert_message, \"Pop up message miss match\", \"Pop up message match\")"  + "</br>"    
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert.accept()"  + "&nbsp;&nbsp;&nbsp;&nbsp;</br>"
      return functionContent

  }

  function generateConfirmCode(flag,labelName)
  {
      var functionContent= ""
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert = driver.switch_to_alert()"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert_message = alert.text"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"log.info(alert_message)"  + "</br>"
      functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"self.assert_equal(data[\""+labelName+"\"], alert_message, \"Pop up message miss match\", \"Pop up message match\")"  + "</br>"
      if(flag == "true")    
        functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert.accept()"  + "&nbsp;&nbsp;&nbsp;&nbsp;</br>"
      else
        functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"alert.dismiss()"  + "&nbsp;&nbsp;&nbsp;&nbsp;</br>"

      return functionContent

  }

  function generateAddScript(functionName, tempFunctionArray)
  {
   
      var functionContent  = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def " +functionName + "_testing(self,driver,data):" + "</br>"

      var functionN = functionName + "_testing(driver,data)"
      //var functionN = "self." + functionName + "_testing(driver,data)"

      FunctionAnil.push([functionN,tempFunctionArray])
    
      if(tempFunctionArray !=null && tempFunctionArray.length > 0 )
      {
        var lableValue = tempFunctionArray[0][0]
        var locatorName = tempFunctionArray[0][1]
        var ids = tempFunctionArray[0][2]
        var ele = tempFunctionArray[0][3]
        var currentElementType = getElementEventType(ele)
        
        functionContent = functionContent + generateWaitCommandHelper(ids,lableValue)
       
        // selenium command . like driver.find_element_by_id(self.lable).send_keys()
        functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + seleniumCommandHelper(ids,lableValue,currentElementType) + "</br></br>"
       }
      return functionContent
    
  }

  function generateVerificationScriptForManual(lableValue,locatorName,ids,ele,newElement,custom)
  {

    var needToAddVerify = "true"
    updateTabValue()

    if(typeof(sessionStorage.currentFrame) != "undefined" && sessionStorage.currentFrame.length == 0)
       sessionStorage.previousFrame = sessionStorage.currentFrame

    //code for frame
    if(typeof(sessionStorage.currentFrame) != "undefined" && sessionStorage.currentFrame.length > 0 &&  (sessionStorage.previousFrame != sessionStorage.currentFrame))
    {   
        var allParentFrameNames = getAllParentFrames(custom)
        var functionContent = tab +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.default_content()"  + "</br>"
        for (var i = 0; i < allParentFrameNames.length; i++)
        {
          functionContent = functionContent + tab + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.frame(\"" + allParentFrameNames[i] + "\")"  + "</br>"        
        }
        functionContent = functionContent + tab + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.frame(\"" + sessionStorage.currentFrame + "\")"  + "</br>"    

        sessionStorage.previousFrame = sessionStorage.currentFrame
        // For Verify 
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + functionContent

    }


    // Code for start For Loop
    if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
    {
      //needToAddVerify = "false"
      sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab2 + "if \"" +lableValue + "_data\" in data:" + "</br>"
      sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab3 + "for i in range(len(data['"+lableValue + "_data'])):</br></br>"
      tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
      tab1 = tab + tab
      tab2 = tab1 + tab1
      tab3 = tab1 + tab1 + tab1   
      tab = tab + tab       

    }

    if(sessionStorage.setLoop && sessionStorage.setLoop == "continue")
    {
      //needToAddVerify = "false" 
      console.log("willl add code ")

    }
    

    if(sessionStorage.endLoop && sessionStorage.endLoop == "true")
    {
      sessionStorage.setLoop = "false"
      sessionStorage.endLoop = "false"
    }


    if(newElement == "true")
    {
        //If new Element during verification then add this condition
      if(ids == "byXpathUsingContains" &&  sessionStorage.UsingbyXpathUsingContains  && sessionStorage.UsingbyXpathUsingContains == "true")
        {
          //updateTabValue()
          sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + tab1 + lableValue + "_Identifier: \""+ sessionStorage.textToLookFor +"\"</br>"

          sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab2 + "locator = " + "self." + lableValue + "</br>"
          sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab2 + "indentifier = " + "data['"+lableValue + "_Identifier']" + "</br>"
          sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab2 + "self."+lableValue  + " = self.generateLocator(indentifier,locator)" + "</br>"
        }

        needToAddVerify = "false" 
        // Verification Code Update
        var scriptVerify = helperForVerification(ids,lableValue,ele)
        if (scriptVerify!=null && scriptVerify.length > 0 )
        { 
          sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab +generateWaitCommandHelperVerify(ids,lableValue)
          sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab2 + "if \"" + lableValue + "\" in data:" + "</br>"
          sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab3 + scriptVerify + "</br></br>"
        }

        // Operation Code Update
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab +generateWaitCommandHelper(ids,lableValue)
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab2 + "if \"" +lableValue + "\" in data:" + "</br>"
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab3 + seleniumCommandHelper(ids,lableValue,currentElementEventType) + "</br></br>"

        // Code for update data file
        generateDataFileForManual(lableValue,ele) 
    }
  
  if(needToAddVerify == "true")
  {
      // Code for Verify Logic
      var scriptVerify = helperForVerification(ids,lableValue,ele)
      if (scriptVerify!=null && scriptVerify.length > 0 )
      { 
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab +generateWaitCommandHelperVerify(ids,lableValue)
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab2 + "if \"" + lableValue + "\" in data:" + "</br>"
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab3 + scriptVerify + "</br></br>"
      }

      //Code for operation
      // if "label" in data:
      if(ele.nodeName.toLowerCase().indexOf("input") == -1 && ele.nodeName.toLowerCase().indexOf("button") == -1 ) 
      {
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual + tab +generateWaitCommandHelper(ids,lableValue)
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab2 + "if \"" +lableValue + "\" in data:" + "</br>"
          // selenium command . like driver.find_element_by_id(self.lable).send_keys()
        sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+ tab3 + seleniumCommandHelper(ids,lableValue,currentElementEventType) + "</br></br>"
      }
  }

}
 
function updateTabValue()
{
    tab = ""
    tab1 = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1

  // Code for start For Loop
  if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
  {
    // code for 
    //sessionStorage.setLoop = "continue"
    //sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab2 + "if \"" +lableValue + "_data\" in data:" + "</br>"
    //sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab3 + "for i in range(len(data['"+lableValue + "_data'])):</br></br>"
    tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab1 = tab + tab
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1   
    tab = tab + tab  


    tab = ""
    tab1 = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1

  }
  if(sessionStorage.setLoop && sessionStorage.setLoop == "continue")
  {
    tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab1 = tab + tab
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1   
    tab = tab + tab  
  }

  if(sessionStorage.endLoop && sessionStorage.endLoop == "true")
  {
    sessionStorage.setLoop = "false"
    sessionStorage.endLoop = "false"
    tab = ""
    tab1 = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1
  }

}   


function generateOperationScriptForManual(lableValue,locatorName,ids,ele,custom)
{

  updateTabValue()
  // Code for start For Loop
  if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
  {
    sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab2 + "if \"" +lableValue + "_data\" in data:" + "</br>"
    sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab3 + "for i in range(len(data['"+lableValue + "_data'])):</br></br>"
    tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab1 = tab + tab
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1   
    tab = tab + tab       
 
  }
  if(sessionStorage.endLoop && sessionStorage.endLoop == "true")
  {
    sessionStorage.setLoop = "false"
    sessionStorage.endLoop = "false"
  }
      //code for frame
    if(typeof(sessionStorage.currentFrame) != "undefined" && sessionStorage.currentFrame.length ==0)
       sessionStorage.previousFrame = sessionStorage.currentFrame

  if(typeof(sessionStorage.currentFrame) != "undefined" && sessionStorage.currentFrame.length > 0 &&  (sessionStorage.previousFrame != sessionStorage.currentFrame))
  {   
    var allParentFrameNames = getAllParentFrames(custom)
    var functionContent = tab +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.default_content()"  + "</br>"
    for (var i = 0; i < allParentFrameNames.length; i++)
    {
      functionContent = functionContent + tab + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.frame(\"" + allParentFrameNames[i] + "\")"  + "</br>"        
    }
    functionContent = functionContent + tab + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +"driver.switch_to.frame(\"" + sessionStorage.currentFrame + "\")"  + "</br>"
    sessionStorage.previousFrame = sessionStorage.currentFrame
      sessionStorage.functionContentManual  = sessionStorage.functionContentManual  + functionContent
  }

  // For table row / column identificatin using identifier 
  if(ids == "byXpathUsingContains" &&  sessionStorage.UsingbyXpathUsingContains  && sessionStorage.UsingbyXpathUsingContains == "true")
  {
    //updateTabValue()
    sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + tab1 + lableValue + "_Identifier: \""+ sessionStorage.textToLookFor +"\"</br>"
    
    sessionStorage.functionContentManual = sessionStorage.functionContentManual + tab2 + "locator = " + "self." + lableValue + "</br>"
    sessionStorage.functionContentManual = sessionStorage.functionContentManual + tab2 + "indentifier = " + "data['"+lableValue + "_Identifier']" + "</br>"
    sessionStorage.functionContentManual = sessionStorage.functionContentManual + tab2 + "self."+lableValue  + " = self.generateLocator(indentifier,locator)" + "</br>"
  }

      
  sessionStorage.functionContentManual = sessionStorage.functionContentManual + tab + generateWaitCommandHelper(ids,lableValue)

    // if "label" in data:
  sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab2 + "if \"" +lableValue + "\" in data:" + "</br>"
   
    // selenium command . like driver.find_element_by_id(self.lable).send_keys()
  sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab3 + seleniumCommandHelper(ids,lableValue,currentElementEventType) + "</br></br>"

    // for Select which have attribute like aria-owns
  if(ele.hasAttribute("aria-owns") || locatorName.indexOf("aria-owns") != -1)
      sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab3 + "driver.find_element_by_xpath(\"//li[contains(.,'\" + data['" + lableValue + "']+\"')]\").click()" + "</br></br>"

  if(ele.nodeName.toLowerCase().indexOf("select") != -1)
       sessionStorage.functionContentManual = sessionStorage.functionContentManual+ tab3 + "driver.find_element_by_xpath(\"//option[contains(.,'\" + data['" + lableValue + "']+\"')]\").click()" + "</br></br>"

}
   

function generateOperationScript(functionName, tempFunctionArray)
{
  
    var functionContent  = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def " +functionName + "_operation(self,driver,data):" + "</br>"

    //var functionN = "self." + functionName + "_operation(driver,data)"   
    var functionN = functionName + "_operation(driver,data)"
    FunctionAnil.push([functionN,tempFunctionArray])

    if(tempFunctionArray !=null && tempFunctionArray.length > 0 )
    {
        for(var i=0;i<tempFunctionArray.length;i++)
        {
          var lableValue = tempFunctionArray[i][0]
          var locatorName = tempFunctionArray[i][1]
          var ids = tempFunctionArray[i][2]
          var ele = tempFunctionArray[i][3]
          var currentElementType = getElementEventType(ele)
 
      

          //code for frame
          //if(allFrameElements.length > 0 )
          //{
              //for(var m=0;m<allFrameElements.length;m++)
              //{
                //if (allFrameElements[m][0] == ele && allFrameElements[m][1] == true)
                  //functionContent = functionContent + generateFrameSwitchCode(allFrameElements[m][2])
              //}
          //}

          // Add Selenium wait 1st
          //if (i==0)
              //functionContent = functionContent + generateWaitCommandHelper(ids,lableValue)

         // Check if current element is a link or a we need to add a selenium wait
          //if (ele !=null && ele.nodeName !=null && (ele.nodeName.toLowerCase() == 'a' || ele.nodeName.toLowerCase() == 'span'))
                functionContent = functionContent + generateWaitCommandHelper(ids,lableValue)

 
          // Code for operation
          // if "label" in data:
          functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" +lableValue + "\" in data:" + "</br>"
         
          // selenium command . like driver.find_element_by_id(self.lable).send_keys()
          functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + seleniumCommandHelper(ids,lableValue,currentElementType) + "</br></br>"

          // for Select which have attribute like aria-owns
          if(ele.hasAttribute("aria-owns") || locatorName.indexOf("aria-owns") != -1)
               functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "driver.find_element_by_xpath(\"//li[contains(.,' + data['" + lableValue + "']+')]\").click()" + "</br></br>"

          if(ele.nodeName.toLowerCase().indexOf("select") != -1)
               functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "driver.find_element_by_xpath(\"//li[contains(.,' + data['" + lableValue + "']+')]\").click()" + "</br></br>"
  

        }
    }
    functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"****** Operation Completed *****\")" + "</br></br>"
    return functionContent
  
}
 
function generateTableContent(headerTable, gridTable)
{
  var temp = []
  if (headerTable !=null && gridTable !=null)
  {
    var headerTableTh = headerTable.getElementsByTagName("th")
    for(var i=0;i<headerTableTh.length;i++)
    {
      if (headerTableTh[i].lastElementChild!=null)
        temp.push(headerTableTh[i].lastElementChild.text)
      else
        temp.push("NA")
    }
    console.log(temp)
    return temp;
  }
  return null
}
 
 
function generateTableVerificationScript(functionName, tempFunctionArray)
{
 
  var functionContent = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def verify_" + functionName + "(self,driver,data):" + "</br>"
  var tableLocatorName = ""
  var headerLocatorName = ""
  var tableVerificationContent = ""
  var tableContentArray 
  var actualHeader 
  var actualTable 

    //var functionN = "self.verify_" + functionName + "(driver,data)"
    var functionN = functionName + "(driver,data)"
    FunctionAnil.push([functionN,tempFunctionArray])
 
    if(tempFunctionArray.length == 1)
    {
          var lableValue = tempFunctionArray[0][0]
          var locatorName = tempFunctionArray[0][1]
          var tableName = tempFunctionArray[0][3]
        
          if (tableName!=null && tableName.tBodies.length > 0 && tableName.tHead !=null)
          {
            actualHeader = tableName
            actualTable  = tableName
          }

    }  
 
    else if(tempFunctionArray !=null && tempFunctionArray.length > 1 )
    {
        for(var i=0;i<tempFunctionArray.length;i++)
        {
          var lableValue = tempFunctionArray[i][0]
          var locatorName = tempFunctionArray[i][1]
 
 
          if (lableValue.indexOf("header") !=-1)
            actualHeader = tempFunctionArray[i][3]
 
          if (lableValue.indexOf("table") !=-1)
            actualTable = tempFunctionArray[i][3]
        }
 
        //actualHeader = findElement(headerLocatorName)
        //actualTable = findElement(tableLocatorName)
 
    }

   if( actualHeader !=null && actualTable!=null)
      tableContentArray  = generateTableContent(actualHeader,actualTable)
    console.log(" generateTableContent :  ", tableContentArray)
    console.log("actualHeader Name : " , actualHeader)
    console.log("actualTable Name : " , actualTable)
   
    for(var i =0 ;i<tableContentArray.length;i++)
    {   
        var prepareTableLocator = tableLocatorName + "//tr[contains(data[\"UNNIQUE_IDENTIFIER\"])]//td[" + (i+1) + "]"
        var columnNameToVerify   = tableContentArray[i]
        
        if (columnNameToVerify != "NA")
        {

          columnNameToVerify = customizedLabel(columnNameToVerify)
          // if "label" in data:
          functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" +columnNameToVerify + "\" in data:" + "</br>"
         
          // selenium command . like driver.find_element_by_id(self.lable).send_keys()
          functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
          "self.assert_equal(str(driver.find_element_by_xpath(self."+ prepareTableLocator + ").text , data['" + columnNameToVerify+ "']," +
          "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + columnNameToVerify + "']"+
          ",  'Screen Name - " +  sessionStorage.pageName +
          " UI verification Successful  : ' + :  data['" + columnNameToVerify + "'])"  + "</br></br>"
        }

    }

    functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"****** Table verification Completed *****\")" + "</br></br>"
    return functionContent
 
}


function generateTableVerificationScriptForManual(functionName, tempFunctionArray)
{
 
  var functionContent = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def verify_" + functionName + "(self,driver,data):" + "</br>"
  var tableLocatorName = ""
  var headerLocatorName = ""
  var tableVerificationContent = ""
  var tableContentArray 
  var actualHeader 
  var actualTable 

    //var functionN = "self.verify_" + functionName + "(driver,data)"
    var functionN = functionName + "(driver,data)"
    FunctionAnil.push([functionN,tempFunctionArray])
 
    if(tempFunctionArray.length == 1)
    {
          var lableValue = tempFunctionArray[0][0]
          var locatorName = tempFunctionArray[0][1]
          var tableName = tempFunctionArray[0][3]
        
          if (tableName!=null && tableName.tBodies.length > 0 && tableName.tHead !=null)
          {
            actualHeader = tableName
            actualTable  = tableName
          }

    }  
 
    else if(tempFunctionArray !=null && tempFunctionArray.length > 1 )
    {
        for(var i=0;i<tempFunctionArray.length;i++)
        {
          var lableValue = tempFunctionArray[i][0]
          var locatorName = tempFunctionArray[i][1]
 
 
          if (lableValue.indexOf("header") !=-1)
            actualHeader = tempFunctionArray[i][3]
 
          if (lableValue.indexOf("table") !=-1)
            actualTable = tempFunctionArray[i][3]
        }
 
        //actualHeader = findElement(headerLocatorName)
        //actualTable = findElement(tableLocatorName)
 
    }

   if( actualHeader !=null && actualTable!=null)
      tableContentArray  = generateTableContent(actualHeader,actualTable)
    console.log(" generateTableContent :  ", tableContentArray)
    console.log("actualHeader Name : " , actualHeader)
    console.log("actualTable Name : " , actualTable)
   
    for(var i =0 ;i<tableContentArray.length;i++)
    {   
        var prepareTableLocator = tableLocatorName + "//tr[contains(data[\"UNNIQUE_IDENTIFIER\"])]//td[" + (i+1) + "]"
        var columnNameToVerify   = tableContentArray[i]
        
        if (columnNameToVerify != "NA")
        {

          columnNameToVerify = customizedLabel(columnNameToVerify)
          // if "label" in data:
          functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" +columnNameToVerify + "\" in data:" + "</br>"
         
          // selenium command . like driver.find_element_by_id(self.lable).send_keys()
          functionContent = functionContent +"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
          "self.assert_equal(str(driver.find_element_by_xpath(self."+ prepareTableLocator + ").text , data['" + columnNameToVerify+ "']," +
          "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + columnNameToVerify + "']"+
          ",  'Screen Name - " +  sessionStorage.pageName +
          " UI verification Successful  : ' + :  data['" + columnNameToVerify + "'])"  + "</br></br>"
        }

    }

    functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"****** Table verification Completed *****\")" + "</br></br>"
    return functionContent
 
}
 
function getElementEventType(elementV)
{
  if (elementV != null)
   {
       elementNodeType = elementV.nodeName.toLowerCase()    
       if (elementNodeType == "span")
            return "click"
       if (elementNodeType == "input")
       {
          elementType = elementV.type
          if (elementType == 'text')
              return "keypress"
          if (elementType == 'submmit')
              return "click"
          if (elementType == 'checkbox')
              return "click"
        }
        else
          return "click"
    }
 
   return null
 
}
 
 
function generateVerificationScript(functionName, tempFunctionArray)
{
  var functionContent = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def verify_" +functionName + "(self,driver,data):" + "&nbsp;&nbsp;&nbsp;&nbsp;</br>"

    //var functionN = "self.verify_" + functionName + "(driver,data)"
    var functionN = "verify_" + functionName + "(driver,data)"
    FunctionAnil.push([functionN,tempFunctionArray])
 
    if(tempFunctionArray !=null && tempFunctionArray.length > 0 )
    {
        for(var i=0;i<tempFunctionArray.length;i++)
        {
          var lableValue = tempFunctionArray[i][0]
          var locatorName = tempFunctionArray[i][1]
          var ids = tempFunctionArray[i][2]
          var ele = tempFunctionArray[i][3]
 
 
          // Code for Verify Logic
          var scriptVerify = helperForVerification(ids,lableValue,ele)
          if (scriptVerify!=null && scriptVerify.length > 0 )
          { 
            functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "if \"" + lableValue + "\" in data:" + "</br>"
            functionContent = functionContent + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + scriptVerify + "</br></br>"
          }
 
        }
    }
    functionContent = functionContent+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"******  Verification for operation Completed *****\")" + "</br></br>"    
    return functionContent
}
 
 
 
function seleniumCommandHelper(identifierName,locator,EventType)
{
   var seleniumReferenceCommand  = {"byId" : "find_element_by_id" , "byName" : "find_element_by_name", "byXpath" : "find_element_by_xpath" ,"byXpathUsingContains" : "find_element_by_xpath" , "byXpathAttributes" : "find_element_by_xpath" , "byXpathPosition" : "find_element_by_xpath", "byDomIndex" : "find_element_by_xpath" , "byXpathHref" : "find_element_by_xpath" , "byXpathIdRelative" : "find_element_by_xpath" , "byXpathImg" : "find_element_by_xpath", "byXpathLink" : "find_elements_by_partial_link_text" , "byCss" : "find_elements_by_css_selector"}
   var elementReferenceEvent = {"click" : "click()" , "keypress": "send_keys" , "keyup": "send_keys", "mouseover": "click()","mousedown": "click()"}
  
   if (elementReferenceEvent[EventType] == 'send_keys')
   { 
        // driver.find_element_by_id(self.label).send(self.label)
       seleniumCommand = "driver." +seleniumReferenceCommand[identifierName]+"(self."+locator+")."+elementReferenceEvent[EventType]+"(data['"+locator+"'])"
       return seleniumCommand
   }
   else
   {
       seleniumCommand = "driver." +seleniumReferenceCommand[identifierName]+"(self."+locator+")."+elementReferenceEvent[EventType]
       return seleniumCommand
   }
}
 
function helperForVerification(identifierName,locator,elementID)
{
   var seleniumReferenceCommand  = {"byId" : "find_element_by_id" , "byName" : "find_element_by_name", "byXpath" : "find_element_by_xpath" ,"byXpathUsingContains" : "find_element_by_xpath" , "byXpathAttributes" : "find_element_by_xpath" , "byXpathPosition" : "find_element_by_xpath", "byDomIndex" : "find_element_by_xpath" , "byXpathHref" : "find_element_by_xpath" , "byXpathIdRelative" : "find_element_by_xpath" , "byXpathImg" : "find_element_by_xpath", "byXpathLink" : "find_elements_by_partial_link_text" , "byCss" : "find_elements_by_css_selector"}
   var elementNodeTypeVerify = {"span" : "text" ,"li" : "text" ,"option" : "text" ,"div" : "text", "text": "get_attribute(\"value\")" ,"textarea": "get_attribute(\"value\")" , "submit": "click()" , "checkbox": "is_selected()","radio": "is_selected()","table" : "text"}
   var seleniumCommandVerify = ""
  
   var typeOfElement = ""
   elementV = elementID
   if (elementV != null)
   {
     elementNodeType = elementV.nodeName.toLowerCase()    
     if (elementNodeType == "span" || elementNodeType == "div" || elementNodeType == "li"  || elementNodeType == "option")
     {
          seleniumCommandVerify = seleniumCommandVerify +
          "self.assert_equal(str(driver." +seleniumReferenceCommand[identifierName]+"(self."+ locator +")."+
          elementNodeTypeVerify["span"] +"), data['" + locator+ "']," +
          "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + locator + "'] + ' : "+locator+"'"+
          ",  'Screen Name - " +  sessionStorage.pageName +
          " UI verification Successful  : ' + data['" + locator + "'] + ' : "+locator+"')"
          return seleniumCommandVerify
 
     }
     if (elementNodeType == "table")
     {
          seleniumCommandVerify = seleniumCommandVerify +
          "self.assert_equal(str(driver." +seleniumReferenceCommand[identifierName]+"(self."+ locator +")."+
          elementNodeTypeVerify["text"] +"), data['" + locator+ "']," +
          "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + locator + "'] + ' : "+locator+"'"+
          ",  'Screen Name - " +  sessionStorage.pageName +
          " UI verification Successful  : ' + data['" + locator + "'] + ' : "+locator+"')"
          return seleniumCommandVerify
 
     }

     if (elementNodeType == "textarea")
     {
          seleniumCommandVerify = seleniumCommandVerify +
          "self.assert_equal(str(driver." +seleniumReferenceCommand[identifierName]+"(self."+ locator +")."+
          elementNodeTypeVerify["textarea"] +"), data['" + locator+ "']," +
          "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + locator + "'] + ' : "+locator+"'"+
          ",  'Screen Name - " +  sessionStorage.pageName +
          " UI verification Successful  : ' + data['" + locator + "'] + ' : "+locator+"')"
          return seleniumCommandVerify

     }

     if (elementNodeType == "input")
     {
        elementType = elementV.type
        if (elementType == 'text')
        {
              seleniumCommandVerify = seleniumCommandVerify +
              "self.assert_equal(str(driver." +seleniumReferenceCommand[identifierName]+"(self."+ locator +")."+
              elementNodeTypeVerify["text"] +"), data['" + locator+ "']," +
              "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + locator + "'] + ' : "+locator+"'"+
              ",  'Screen Name - " +  sessionStorage.pageName +
              " UI verification Successful  : ' + data['" + locator + "'] + ' : "+locator+"')"
              return seleniumCommandVerify
        }
        if (elementType == 'submmit')
        {
          console.log("its a button")
            // ignore
        }
        if (elementType == 'checkbox')
          {
              seleniumCommandVerify = seleniumCommandVerify +
              "self.assert_equal(str(driver." +seleniumReferenceCommand[identifierName]+"(self."+ locator +")."+
              elementNodeTypeVerify["checkbox"] +"), data['" + locator+ "']," +
              "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + locator + "'] + ' : "+locator+"'"+
              ",  'Screen Name - " +  sessionStorage.pageName +
              " UI verification Successful  : ' + data['" + locator + "'] + ' : "+locator+"')"
              return seleniumCommandVerify
          }

        if (elementType == 'radio')
          {
              seleniumCommandVerify = seleniumCommandVerify +
              "self.assert_equal(str(driver." +seleniumReferenceCommand[identifierName]+"(self."+ locator +")."+
              elementNodeTypeVerify["radio"] +"), data['" + locator+ "']," +
              "'Screen Name - " + sessionStorage.pageName + ", Failed in UI verification  : ' + " + "data['" + locator + "'] + ' : "+locator+"'"+
              ",  'Screen Name - " +  sessionStorage.pageName +
              " UI verification Successful  : ' + data['" + locator + "'] + ' : "+locator+"')"
              return seleniumCommandVerify
          }

        }
      }
 
   return null
 
}
 
function generateWaitCommandHelper(identifierName,locator)
{
 
  var seleniumReferenceCommand  = {"byId" : "ID" , "byName" : "NAME", "byXpath" : "XPATH" ,"byXpathUsingContains" : "XPATH" , "byXpathAttributes" : "XPATH" , "byXpathPosition" : "XPATH", "byDomIndex" : "XPATH" , "byXpathHref" : "XPATH" , "byXpathIdRelative" : "XPATH" , "byXpathImg" : "XPATH", "byXpathLink" : "PARTIAL_LINK_TEXT" , "byCss" : "CSS_SELECTOR"}
  
  var htmlContent  = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;wait = WebDriverWait(driver, 200)</br>" +
                      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;wait.until(EC.element_to_be_clickable((By." +seleniumReferenceCommand[identifierName]+ ",self." + locator +  ")),'"+ locator + " Element not loaded')</br>" +
                      "</br>"
  return htmlContent
}

function generateWaitCommandHelperVerify(identifierName,locator)
{
 
  var seleniumReferenceCommand  = {"byId" : "ID" , "byName" : "NAME", "byXpath" : "XPATH" ,"byXpathUsingContains" : "XPATH" , "byXpathAttributes" : "XPATH" , "byXpathPosition" : "XPATH", "byDomIndex" : "XPATH" , "byXpathHref" : "XPATH" , "byXpathIdRelative" : "XPATH" , "byXpathImg" : "XPATH", "byXpathLink" : "PARTIAL_LINK_TEXT" , "byCss" : "CSS_SELECTOR"}
  
  var htmlContent  = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;wait = WebDriverWait(driver, 200)</br>" +
                      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;wait.until(EC.presence_of_element_located((By." +seleniumReferenceCommand[identifierName]+ ",self." + locator +  ")),'"+ locator + " Element not loaded')</br>" +
                      "</br>"
  return htmlContent
}
  
function elementContainAttribute(e,attrName)
{
 
  // check if the element is a lable tag
  if (e !=null && e.nodeName.toLowerCase().indexOf(attrName) !== -1 )
    return e
 
  // check for attribute contains lable
  if (e !=null && e.attributes)
  {
    var atts = e.attributes;
    //var attsMap = {};
    for (i = 0; i < atts.length; i++)
     {
      var att = atts[i];
      if (att.localName.toLowerCase().indexOf(attrName) !== -1 || att.value.toLowerCase().indexOf(attrName) !== -1)
          return e
     }
  }
 
  return null;
}
 
 
 
function getElementContainsLableHelper(elementToGenerateName)
{
 
  if (elementToGenerateName!=null)
  {
    //check if this element  is a span , button
    //tagsToIgnore = ["span" , "button"]
    tagsToIgnore = ["button" , "table" , "a"]
    if ( elementToGenerateName.nodeName !=null &&  elementToGenerateName.nodeName.length > 0 && tagsToIgnore.includes(elementToGenerateName.nodeName.toLowerCase()))
        return elementToGenerateName;
   
    //check if this element  is a label
    ownCheck = elementContainAttribute(elementToGenerateName,'label')
    if (ownCheck != null)
       return ownCheck;
  
    // if element previousSibling contain label.
    //previousSiblingElementAtt = elementContainAttribute(elementToGenerateName.previousElementSibling,'label')
    previousSiblingElementAtt = checkChildElementContainAttribute(elementToGenerateName.previousElementSibling,'label')
    if (previousSiblingElementAtt != null)
       return previousSiblingElementAtt;

    // if element nextSibling contain label.
    //nextSiblingElementAtt = elementContainAttribute(elementToGenerateName.nextElementSibling,'label')
    nextSiblingElementAtt = checkChildElementContainAttribute(elementToGenerateName.nextElementSibling,'label')
    if (nextSiblingElementAtt != null)
       return nextSiblingElementAtt;
 
    // check for any node of parent.parent contain label attribute or any class with label.
    parentChildrensCount =   checkChildElementContainAttribute(elementToGenerateName.parentNode,'label')
    if (parentChildrensCount != null)
       return parentChildrensCount;

    parentPreviousElementSiblingCheck =   checkChildElementContainAttribute(elementToGenerateName.parentNode.previousElementSibling,'label')
    if (parentPreviousElementSiblingCheck != null)
       return parentPreviousElementSiblingCheck;
 
    // check for any node of parent.parent contain label attribute or any class with label.
    parentParentChildrensCount =   checkChildElementContainAttribute(elementToGenerateName.parentNode.parentNode,'label')
    if (parentParentChildrensCount != null)
       return parentParentChildrensCount;
 
    // check for any node of parent.parent.parent contain label attribute or any class with label.
    parentParentChildrensCount =   checkChildElementContainAttribute(elementToGenerateName.parentNode.parentNode.parentNode,'label')
    if (parentParentChildrensCount != null)
       return parentParentChildrensCount;
 
    // check for any node of parent.parent.parent contain label attribute or any class with label.
    parentParentParentChildrensCount =   checkChildElementContainAttribute(elementToGenerateName.parentNode.parentNode.parentNode.parentNode,'label')
    if (parentParentParentChildrensCount != null)
       return parentParentParentChildrensCount;
 
    // NO match , then check for name and send the current element
    if (elementToGenerateName.name !=null &&  elementToGenerateName.name.length > 0 )
      return elementToGenerateName;
 
    // NO match , then check for id and send the current element
    if (elementToGenerateName.id !=null &&  elementToGenerateName.id.length > 0 )
      return elementToGenerateName;
 

  }
  //return null
  return null
 
}
 
function isElementIsATab(elementToGenerateName)
{
  if (elementToGenerateName!=null)
  {
 
      //check if this element is a contain tab as a string
      ownCheck = elementContainAttribute(elementToGenerateName,"tab")
      if (ownCheck != null && ownCheck.attributes["role"] !=null && ownCheck.attributes["role"].value == 'tab')
         return true
      
      // check for any node of parent.parent contain label attribute or any class with label.
      parentParentChildrensCount =  checkChildElementContainAttribute(elementToGenerateName.parentNode.parentNode,"tab")
      if (parentParentChildrensCount != null && parentParentChildrensCount.attributes["role"] !=null && parentParentChildrensCount.attributes["role"].value == 'tab')
         return true
  }
  //return false
  return false
 
}
 
 
function checkChildElementContainAttribute(elementToCheck,attName)
{
  if (elementToCheck!= null)
  {
      // own check 
      //check if this element  is a label
      ownCheck = elementContainAttribute(elementToCheck,attName)
      if (ownCheck != null)
         return ownCheck;

      // if element previousSibling contain label.
      previousSiblingElementAtt = elementContainAttribute(elementToCheck.previousElementSibling,attName)
      if (previousSiblingElementAtt != null)
         return previousSiblingElementAtt;

      // if element nextSibling contain label.
      nextSiblingElementAtt = elementContainAttribute(elementToCheck.nextElementSibling,attName)
      if (nextSiblingElementAtt != null)
         return nextSiblingElementAtt;

      childrensCount =   elementToCheck.childElementCount
      for(var i=0;i<childrensCount;i++)
      {  
        child = elementToCheck.children[i]
        childElementAtt = elementContainAttribute(child,attName)
 
          if (childElementAtt != null)
              return child;
 
          return checkChildElementContainAttribute(child,attName)
           
      }
  }
  return null
}
 
 
function generateLocatorNameHelper(locator,custom)
{
  elementToGenerateName = findElement(locator,custom)
  if (elementToGenerateName !=null)
    {
      forElement = getElementContainsLableHelper(elementToGenerateName)
      console.log("Label Identifier Element : " , forElement)     
      //isElementIsATab  
      var tab = isElementIsATab(elementToGenerateName) ? " tab" : "";
 
      if (forElement !=null)
      {
         if (forElement.nodeName !=null &&  forElement.nodeName.toLowerCase() == "table")
            return preferedLabelForTable(elementToGenerateName,custom).trim() + tab
 
         if (forElement.getAttribute("for") !=null  && forElement.getAttribute("for").trim().length  > 0)
            return forElement.getAttribute("for").trim() + tab
 
         if (forElement.nodeName !=null &&  forElement.nodeName.toLowerCase() == "a" && forElement.firstElementChild !=null && (elementContainAttribute(forElement.firstElementChild,"edit") || elementContainAttribute(forElement.firstElementChild,"delete")))
            return preferedLabelForA(elementToGenerateName,custom).trim() + tab
        
         if (forElement.title !=null && forElement.title.trim().length  > 0)
            return forElement.title.trim() + tab
 
         if (forElement.value !=null && forElement.value.trim().length  > 0)
            return forElement.value.trim() + tab
 
         if (forElement.innerText !=null  && forElement.innerText.trim().length  > 0)
            return forElement.innerText.trim() + tab
 
         if (forElement.name !=null  && forElement.name.trim().length  > 0)
            return forElement.name.trim() + tab
 
         if (forElement.id !=null  && forElement.id.trim().length  > 0)
            return forElement.id.trim() + tab
 
      }
     forElement = elementToGenerateName
     if (forElement.getAttribute("for") !=null  && forElement.getAttribute("for").trim().length  > 0)
        return forElement.getAttribute("for").trim() + tab        
     if (forElement.title !=null && forElement.title.trim().length  > 0)
        return forElement.title.trim() + tab
     if (forElement.name !=null  && forElement.name.trim().length  > 0)
        return forElement.name.trim() + tab
     if (forElement.id !=null  && forElement.id.trim().length  > 0)
        return forElement.id.trim() + tab
     if (forElement.value !=null && forElement.value.trim().length  > 0)
        return forElement.value.trim() + tab
     if (forElement.innerText !=null  && forElement.innerText.trim().length  > 0)
        return forElement.innerText.trim() + tab
 
    }
  return null
}
 
function preferedLabelForTable(tableId,custom)
{  
   
    var append_to_table_name = tableId.tHead !=null ? " header" : " table"
    var locatorTable  = byXpath(tableId,custom)
 
    return locatorTable.split("'")[1] + append_to_table_name   
}
 
 
function preferedLabelForA(tableId,custom)
{  
   
    var append_to_table_name = tableId.tHead !=null ? " header" : " table"
    var append_to_action_name = ""
 
    if (tableId.firstElementChild !=null)
    {
      if (elementContainAttribute(tableId.firstElementChild,"edit"))
      {
        append_to_action_name = " edit"
      }
 
      if (elementContainAttribute(tableId.firstElementChild,"delete"))
      {
        append_to_action_name = " delete"
      }
    }
 
    var locatorTable  = byXpath(tableId,custom)
 
    return locatorTable.split("'")[1] + append_to_table_name + append_to_action_name
}
 
function preferedLocator(elementIDs,elementNodeType)
{
  //var fe = findElement(locator);
 
  var precedency = ["byId", "byName", "byXpath", "byXpathUsingContains","byXpathAttributes", "byXpathPosition", "byDomIndex", "byXpathHref", "byXpathIdRelative", "byXpathImg", "byXpathLink", "byCss"];
  var spanPrecedency = ["byXpathUsingContains","byId", "byName","byXpath", "byXpathLink", "byXpathAttributes", "byXpathPosition", "byDomIndex", "byXpathHref", "byXpathIdRelative", "byXpathImg", "byCss"];
 
  if (elementNodeType.nodeName != null &&  ((elementNodeType.nodeName.toLowerCase() == 'span' && !(elementNodeType.hasAttribute('aria-owns'))) ||  elementNodeType.nodeName.toLowerCase() == 'a' ||  elementNodeType.nodeName.toLowerCase() == 'li' ||  elementNodeType.nodeName.toLowerCase() == 'ul' || elementNodeType.nodeName.toLowerCase() == 'div' ))
  {
      for (var prefer in spanPrecedency)
      {
        var preferedIdentifier = spanPrecedency[prefer]
        if (preferedIdentifier in elementIDs)
        {
          prefereElementID = {}
          prefereElementID[preferedIdentifier] = elementIDs[preferedIdentifier];
          return  prefereElementID;
        }
      }
  }
  else if (elementNodeType.nodeName != null &&  (elementNodeType.nodeName.toLowerCase() == 'tr' || elementNodeType.nodeName.toLowerCase() == 'td'))
  {
      for (var prefer in spanPrecedency)
      {
        var preferedIdentifier = spanPrecedency[prefer]
        if (preferedIdentifier in elementIDs)
        {
          prefereElementID = {}
          prefereElementID[preferedIdentifier] = elementIDs[preferedIdentifier];
          return  prefereElementID;
        }
      }
 
  }
else
  {
      for (var prefer in precedency)
      {
        var preferedIdentifier = precedency[prefer]
        if (preferedIdentifier in elementIDs)
        {
          prefereElementID = {}          
          prefereElementID[preferedIdentifier] = elementIDs[preferedIdentifier];
          return  prefereElementID;
        }
      }
 
  } 
}
 
 
 
function printHTMLFooter(window_handle)
{
  htmlFooter = "<tr><th colspan=4 align='right' <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=6 color=&quot;#FF0000&quot;><font face=Verdana color=grey> © Anil  Cisco Systems </font></t></tr></tbody></table></body></html>";
  htmlActionButton = "<button id='downloadData' class='button' value='Download Data File'> Download Data File </button>"+
  "<button id='downloadScript' class='button' value='Download Script File'> Download Script File </button>"+
  "<button id='downloadSpec' class='button' value='Download Spec File'> Download Spec File </button>"+
  "<button id='downloadLocator' class='button' value='Download Locator File'> Download Locator File </button>" +
  "<button id='downloadJob' class='button' value='Download Job File'> Download Job File </button>" +
  "<button id='downloadLib' class='button' value='Download Library File'> Download Library File </button>" +
  "<button id='downloadServerDetail' class='button' value='Download Server Detail File'> Download Server File </button>" +
  "<br><label for='userDefinedClassName'>Class Name : </label><input type='text' id='userDefinedClassName' style='height: 3em;border-color: black;' value='DemoClass'>" + 
  "<label for='addNewScenario'>   Add New Scenario  </label><input type='checkbox' id='addNewScenario'> </br>" + "</br>" + "</br>" +
  '<div style="font-size: 1.5em;padding-left: 10em;">********************************** Please follow below Steps for Execution *********************************</div></br>'+
  '<div style="font-size: 1.5em;padding-left: 15em;">1. User Need to be in PYATS Prompt </div>'+
  '<div style="font-size: 1.5em;padding-left: 15em;">2. Move to Job file </div> ' + 
  '<div style="font-size: 1.5em;padding-left: 15em;">3. Execute Command : easypy DemoClass.py -selenium_server SELENIUM_SERVER_2 -config_file device.yaml</div></br>'+
  '<div style="font-size: 1.5em;padding-left: 10em;">****************************************************************************************************** </div>'

  window_handle.document.write(htmlFooter)
  window_handle.document.write(htmlActionButton)
}
 
function printHTMLSeparator(window_handle)
{
  htmlSeparator= "<tr><td <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=6 color=&quot;#FF0000&quot;> <h2><font face=Verdana color=grey>*************</font></h2></td><td <font face=&quot;Garamond, Times New Roman, Georgia&quot; size=6 color=&quot;#FF0000&quot;> <h2><font face=Verdana color=grey>********</font></h2></td></tr>";
  window_handle.document.write(htmlSeparator)
}
 
//-----------------------------------------------------------
var currentElement = null
var currentContextElement = null
var previousElement = null
var previousElementEventType = null
var currentElementEventType = null
var alreadyDisplayed = "no"
 
 
function printLocator()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var currentLocatorClassName  = currentClassName +"Locator"
 
  htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Locator FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 4em; }" +
  "tab1 { padding-left: 2em; }" + 
  "</style></head><body >";

  var locatorDocumentContentStart = "# Please Save this File as locator\\" +
  currentClassName.toLowerCase() + "_locator.py" +"</br></br>"+
  "__author__ = 'vnagaman'" +"</br>"+
  "import logging" +"</br>" +
  "from library.lib import *"+ "</br>" +
  "log = logging.getLogger(__name__)" + "</br>" +
  "class "+ currentLocatorClassName +
  "():"+ "</br>" +  "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;def __init__(self):" + "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FlexLib.__init__(self)" + "</br>"
 
  locatorDocumentContentEnd = ""
  locator_window = window.open("locator_window","com_MyDomain_locator")
  locator_window.document.write('');
  locator_window.document.write(htmlBody)
  if(sessionStorage.addNewScenario == "false")
    locator_window.document.write(locatorDocumentContentStart)
  locator_window.document.write(sessionStorage.locatorDocumentContent)
  
}
 
function printScriptManual()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var currentLocatorClassName  = currentClassName +"Locator"
 
  htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Script FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 4em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";
  
  tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
  tab1 = tab + tab
  tab2 = tab + tab + tab
  tab3 = tab2 + tab

  var scriptDocumentContentStart = "# Please Save this File as script\\" +
  currentClassName.toLowerCase() + ".py" +"</br></br>" +
  "__author__ = 'vnagaman'" +"</br>"+
  "from locator." +
  currentClassName.toLowerCase() +  "_locator import *" +"</br>" +
  "from library.lib import *"+ "</br>" +
  //"from library.lib import *" + "</br>" +
  //"from library.telnet_library import *" + "</br>" +
  "class " + currentClassName +
  "(FlexLib, " + currentLocatorClassName+
  "):"+ "</br>" +  "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;def __init__(self):" + "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FlexLib.__init__(self)" + "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ currentLocatorClassName +
  ".__init__(self)" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</br>" + "</br>" +  "</br>" +
  tab +  'def generateLocator(self,indentifier,locator):'+ "<br>" +
  tab1 + '    actual = ""'+ "<br>" +
  tab1 + '    names  = indentifier.split("  ")'+ "<br>" +
  tab1 + '    for i in range(len(names)):'+ "<br>" +
  tab2 + '        actual = actual + "contains(.,\'"+names[i]+"\')"'+ "<br>" +
  tab2 + '        if (i< len(names) -1):'+ "<br>" +
  tab3 + '            actual = actual + " and "'+ "<br>" +
  tab1 + '    locator = locator.replace("IDENTIFIER", actual)'+ "<br>" +
  tab1 + '    return locator'; "<br>" 


  var scriptFunctionStart = "</br></br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def " + sessionStorage.pageName + "_operation(self,driver,data):" + "</br>"

  script_window = window.open("script_window","com_MyDomain_script")
  // To Clear the content each time
  script_window.document.write('');
  script_window.document.write(htmlBody)
  if(sessionStorage.addNewScenario == "false")
  {
    script_window.document.write(scriptDocumentContentStart)
  }
  script_window.document.write(scriptFunctionStart)

  sessionStorage.functionContentManual = sessionStorage.functionContentManual.replace("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info(\"****** Operation Completed *****\")</br></br>","")
  sessionStorage.functionContentManual = sessionStorage.functionContentManual+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"****** Operation Completed *****\")" + "</br></br>"
  script_window.document.write(sessionStorage.functionContentManual)

  var verifyFunctionContentStart = "</br>" + "&nbsp;&nbsp;&nbsp;&nbsp;def verify_" +sessionStorage.pageName + "_operation(self,driver,data):" + "&nbsp;&nbsp;&nbsp;&nbsp;</br>" + 
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "#driver.refresh()</br></br>"

  script_window.document.write(verifyFunctionContentStart)
  sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual.replace("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info(\"******  Verification for operation Completed *****\")</br></br>","")  
  sessionStorage.verifyFunctionContentManual = sessionStorage.verifyFunctionContentManual+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "log.info(\"******  Verification for operation Completed *****\")" + "</br></br>"    
  script_window.document.write(sessionStorage.verifyFunctionContentManual)
}

   
function printScript()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var currentLocatorClassName  = currentClassName +"Locator"
 
  htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Script FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 4em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";
  
  var scriptDocumentContentStart = "# Please Save this File as " +
  currentClassName.toLowerCase() + ".py" +"</br></br>" +
  "__author__ = 'vnagaman'" +"</br>"+
  "from locator." +
  currentClassName.toLowerCase() +  "_locator import *" +"</br>" +
  "from library.lib import *"+ "</br>" +
  "from library.telnet_library import *" + "</br>" +
  "class " + currentClassName +
  "(FlexLib, " + currentLocatorClassName+
  "):"+ "</br>" +  "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;def __init__(self):" + "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FlexLib.__init__(self)" + "</br>" +
  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+ currentLocatorClassName +
  ".__init__(self)" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</br>" + "</br>" +  "</br>"
 
 
  generateScript()
  script_window = window.open("script_window","com_MyDomain_script")
  // To Clear the content each time
  script_window.document.write('');
  script_window.document.write(htmlBody)
  script_window.document.write(scriptDocumentContentStart)
  script_window.document.write(scriptDocumentContent)
  script_window.document.write(verifyScriptDocumentContent)  
}


function printLib()
{
  htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Lib FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 4em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";
  
  tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
  tab1 = tab + tab
  tab2 = tab + tab + tab 
  tab3 = tab + tab + tab + tab
  tab4 = tab + tab + tab + tab + tab
  tab5 = tab + tab + tab + tab + tab + tab



  var libDocumentContentStart = "# Please Save this File as " + "\\library\\lib.py" +"</br></br>"
  libDocumentContentStart = libDocumentContentStart +  '__author__ = \'anpradha\''+ "<br>" +
  'from selenium import webdriver'+ "<br>" +
  'from selenium.webdriver.chrome.options import Options'+ "<br>" +
  'from selenium.webdriver.support.ui import WebDriverWait'+ "<br>" +
  'from selenium.webdriver.common.action_chains import ActionChains'+ "<br>" +
  'from selenium.webdriver.support import expected_conditions as EC'+ "<br>" +
  'from selenium.webdriver.common.by import By'+ "<br>" +
  'from selenium.webdriver.common.keys import Keys'+ "<br>" +
  'from selenium.common.exceptions import NoAlertPresentException'+ "<br>" +
  'from selenium.common.exceptions import NoSuchElementException'+ "<br>" +
  'from selenium.common.exceptions import TimeoutException'+ "<br>" +
  'import time'+ "<br>" +
  'import yaml'+ "<br>" +
  'import json'+ "<br>" +
  'import os'+ "<br>" +
  'from ats import easypy'+ "<br>" +
  'import html'+ "<br>" +
  'import re'+ "<br>" + "<br>" +
  'import subprocess'+ "<br>" +
  'from subprocess import PIPE, Popen'+ "<br>" +
  'import logging'+ "<br>" + "<br>" + "<br>" +
  '# Get your logger for your script'+ "<br>" +
  'log = logging.getLogger(__name__)'+ "<br>" +
  ''+ "<br>" +
  ''+ "<br>" + "<br>" +
  'class Testbed:'+"<br>" +
  tab + '    testbed = {}'+ "<br>" +
  tab + '    TESTBED_NOT_DEFINED = """TESTBED variable is not set.'+ "<br>" +
  tab + '    Please pass TESTBED as an argument by -config_file device_config.yaml.'+ "<br>" +
  tab + '    """'+ "<br>" +
  tab + '    SELNIUM_SERVER_NOT_DEFINED = """Selenium Server variable is not set.'+ "<br>" +
  tab + '    Please pass Selenium Server as an argument by -selenium_server SELENIUM_SERVER_1'+ "<br>" +
  tab + '    """'+ "<br>" +
  ''+
  tab + '    def __init__(self):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            testbedPath = os.environ["TESTBED"]'+ "<br>" +
  tab1 + '        except KeyError:'+ "<br>" +
  tab2 + '            log.info(self.TESTBED_NOT_DEFINED)'+ "<br>" +
  tab2 + '            raise'+ "<br>" +
  tab1 + '        self.testbedFile = open(testbedPath, "r")'+ "<br>" +
  tab1 + '        self.testbed = yaml.load(self.testbedFile)'+ "<br>" + "<br>" +
  ''+
  tab + '    def get_selenium_details(self):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            return self.testbed[os.environ["SELENIUM_SERVER"]]'+ "<br>" +
  tab1 + '        except KeyError:'+ "<br>" +
  tab2 + '            log.info(self.SELNIUM_SERVER_NOT_DEFINED)'+ "<br>" +
  tab2 + '            raise'+ "<br>" + "<br>" +
  ''+
  tab + '    def get_browser_details(self):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            return self.testbed[os.environ["SELENIUM_SERVER"]]["browser"]'+ "<br>" +
  tab1 + '        except KeyError:'+ "<br>" +
  tab2 + '            log.info(self.SELNIUM_SERVER_NOT_DEFINED)'+ "<br>" +
  tab2 + '            raise'+ "<br>" + "<br>" +
  ''+
  tab + '    def get_platform_details(self):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            return self.testbed[os.environ["SELENIUM_SERVER"]]["platform"]'+ "<br>" +
  tab1 + '        except KeyError:'+ "<br>" +
  tab2 + '            log.info(self.SELNIUM_SERVER_NOT_DEFINED)'+ "<br>" +
  tab2 + '            raise'+ "<br>" + "<br>" +
  ''+
  tab + '    def get_environment_details(self):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            return self.testbed[os.environ["SELENIUM_SERVER"]]["environment"]'+ "<br>" +
  tab1 + '        except KeyError:'+ "<br>" +
  tab2 + '            log.info(self.SELNIUM_SERVER_NOT_DEFINED)'+ "<br>" +
  tab2 + '            raise'+ "<br>" + "<br>" +
  ''+
  tab + '    def get_url_details(self):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            return self.testbed[os.environ["SELENIUM_SERVER"]]["url"]'+ "<br>" +
  tab1 + '        except KeyError:'+ "<br>" +
  tab2 + '            log.info(self.SELNIUM_SERVER_NOT_DEFINED)'+ "<br>" +
  tab2 + '            raise'+ "<br>" + "<br>" +
  ''+
  'class FlexLib:'+ "<br>" + "<br>" +
  ''+
  tab + '    def __init__(self):'+ "<br>" +
  tab1 + '        self.testbed = Testbed()'+ "<br>" + "<br>" +
  ''+
  ''+
  tab + '    def load_yaml_file(self, script_name, script_location):'+ "<br>" +
  tab1 + '        try:'+ "<br>" +
  tab2 + '            script_name = script_name.replace("_test.py", ".yaml")'+ "<br>" +
  tab2 + '            log.info(script_name)'+ "<br>" +
  tab2 + '            self.yaml_path = os.path.join(script_location, "dataset", script_name)'+ "<br>" +
  tab2 + '            dataFile = open(self.yaml_path, "r")'+ "<br>" +
  tab2 + '            self.dataValues = yaml.load(dataFile)'+ "<br>" +
  tab2 + '            final_dict = {}'+ "<br>" +
  tab2 + '            primary_keys = list(self.dataValues.keys())'+ "<br>" +
  tab2 + '            for i in range(len(primary_keys)):'+ "<br>" +
  tab3 + '                data = list(self.dataValues[primary_keys[i]])'+ "<br>" +
  tab3 + '                newdata = []'+ "<br>" +
  tab3 + '                for j in range(len(data)):'+ "<br>" +
  tab4 + '                    newdata.append(data[j])'+ "<br>" +
  tab3 + '                final_dict[primary_keys[i]] = newdata'+ "<br>" +
  tab1 + '        except Exception as e:'+ "<br>" +
  tab2 + '            log.info("Error occurred during reading yaml file : " + self.yaml_path)'+ "<br>" +
  tab2 + '            raise '+ "<br>" +
  tab1 + '        return final_dict'+ "<br>" + "<br>" +
  tab + '    '+
  tab + ''+ "<br>" +
  tab + ''+ "<br>" +
  tab + '    def start_selenium_server(self):'+ "<br>" +
  tab1 + '        if self.testbed.get_environment_details().lower() == "remote":'+ "<br>" +
  tab2 + '            # time.sleep(10)'+ "<br>" +
  tab2 + '            browser = self.testbed.get_browser_details()'+ "<br>" +
  tab2 + '            selenium_dict = self.testbed.get_selenium_details()'+ "<br>" +
  tab2 + '            if selenium_dict["hub"]["selenium_hub_port"].lower() == "none":'+ "<br>" +
  tab3 + '                hub_port = "4444"'+ "<br>" +
  tab2 + '            else:'+ "<br>" +
  tab3 + '                hub_port = selenium_dict["hub"]["selenium_hub_port"] '+ "<br>" +
  tab2 + '            if selenium_dict["node"]["selenium_node_port"].lower() == "none":'+ "<br>" +
  tab3 + '                node_port = "5555"'+"<br>" +
  tab2 + '            else:'+ "<br>" +
  tab3 + '                node_port = selenium_dict["node"]["selenium_node_port"] '+ "<br>" +
  tab2 + '            selenium_dict = self.testbed.get_selenium_details()'+ "<br>" +
  tab2 + '            node_ip = selenium_dict["node"]["selenium_node_ip"]'+ "<br>" +
  tab2 + '            hub_ip = selenium_dict["hub"]["selenium_hub_ip"]'+ "<br>" +
  tab2 + '            node_user = selenium_dict["node"]["selenium_node_user"]'+ "<br>" +
  tab2 + '            hub_jar_path = os.path.join(selenium_dict["hub"]["selenium_hub_path_to_jar"], selenium_dict["hub"]["selnium_hub_jar_name"])'+ "<br>" +
  tab2 + '            command = \'java -jar \' + hub_jar_path + \' -role hub -host \' + hub_ip + \' -port \' + hub_port'+ "<br>" +
  tab2 + '            self.hub_proc = subprocess.Popen(command, shell=True, stdin=None, stdout=None, stderr=None, close_fds=True)'+ "<br>" +
  tab2 + '            log.info("<<<<<<<<<<<< Selenium Hub Started >>>>>>>>>>>")'+ "<br>" +
  tab2 + '            node_jar_path = selenium_dict["node"]["selenium_node_path_to_jar"] + selenium_dict["node"]["selenium_node_jar_name"]'+ "<br>" +
  tab2 + '            if browser.lower() == "chrome" :'+ "<br>" +
  tab3 + '                newcmd = "java -jar " + node_jar_path + " -role node -host " + node_ip + " -port " + node_port + " -hub http://" + hub_ip + ":" + hub_port + "/grid/register -Dwebdriver.chrome.driver=" + selenium_dict["node"]["selenium_node_path_to_jar"] + "/chromedriver.exe"'+ "<br>" +
  tab2 + '            else:'+ "<br>" +
  tab3 + '                newcmd = "java -jar " + node_jar_path + " -role node -host " + node_ip + " -port " + node_port + " -hub http://" + hub_ip + ":" + hub_port + "/grid/register"'+ "<br>" +
  tab2 + '            final_cmd = " start " + newcmd + " /K " + "cmd.exe"'+ "<br>" +
  tab2 + '            node_cmd = "rsh " + node_ip + " -l " + node_user + final_cmd'+ "<br>" +
  tab2 + '            self.node_proc = subprocess.Popen(node_cmd, shell=True, stdin=None, stdout=None, stderr=None, close_fds=True)'+ "<br>" +
  tab2 + '            log.info("<<<<< Waiting 10 Seconds for Selenium Node to Join >>>>>>>")'+ "<br>" +
  tab2 + '            time.sleep(10)'+ "<br>" +
  tab2 + '            log.info("<<<<<<<< Node Joined to Hub >>>>>>>>>")'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + '    def stop_selenium_server(self):'+ "<br>" +
  tab1 + '        if self.testbed.get_environment_details().lower() == "remote":'+ "<br>" +
  tab2 + '            # time.sleep(10)'+ "<br>" +
  tab2 + '            selenium_dict = self.testbed.get_selenium_details()'+ "<br>" +
  tab2 + '            if selenium_dict["hub"]["selenium_hub_port"].lower() == "none":'+ "<br>" +
  tab3 + '                hub_port = "4444"'+ "<br>" +
  tab2 + '            else:'+ "<br>" +
  tab3 + '                hub_port = selenium_dict["hub"]["selenium_hub_port"]  '+ "<br>" +
  tab2 + '            hub_kill_cmd = "ps -ef | grep " + hub_port'+ "<br>" +
  tab2 + '            self.hub_kill_proc = subprocess.Popen(hub_kill_cmd, shell=True, stdin=None, stdout=PIPE, stderr=None)'+ "<br>" +
  tab2 + '            out, err = self.hub_kill_proc.communicate()'+ "<br>" +
  tab2 + '            if out != None and out.decode("utf-8").strip() != "":'+ "<br>" +
  tab3 + '                log.info("Output hub pid is:" + out.decode("utf-8"))'+ "<br>" +
  tab3 + '                outlines = out.decode("utf-8").strip().split("\\n")'+ "<br>" +
  tab3 + '                for i in range(len(outlines)):'+ "<br>" +
  tab4 + '                    if "grep" not in outlines[i]:'+ "<br>" +
  tab5 + '                        port_out = outlines[i].split()[1]'+ "<br>" +
  tab5 + '                        log.info("PID is:" + port_out)'+ "<br>" +
  tab5 + '                        hub_kill_port = "kill -9 " + port_out'+ "<br>" +
  tab5 + '                        self.hub_kill = subprocess.Popen(hub_kill_port, shell=True, stdin=None, stdout=None, stderr=None, close_fds=True)'+ "<br>" +
  tab2 + '            log.info("<<<<<<<<<<<<<< Selenium Hub Stopped >>>>>>>>>>>>>>")'+ "<br>" +
  tab2 + '            selenium_dict = self.testbed.get_selenium_details()'+ "<br>" +
  tab2 + '            node_ip = selenium_dict["node"]["selenium_node_ip"]'+ "<br>" +
  tab2 + '            node_user = selenium_dict["node"]["selenium_node_user"]'+ "<br>" +
  tab2 + '            if selenium_dict["node"]["selenium_node_port"].lower() == "none":'+ "<br>" +
  tab3 + '                node_port = "5555"'+ "<br>" +
  tab2 + '            else:'+ "<br>" +
  tab3 + '                node_port = selenium_dict["node"]["selenium_node_port"]'+ "<br>" +
  tab2 + '            node_cmd = \'rsh \' + node_ip + \' -l \' + node_user + \' "netstat -a -o -n | findstr "\' + node_port + \'" | findstr LISTENING"\''+ "<br>" +
  tab2 + '            self.node_proc = subprocess.Popen(node_cmd, shell=True, stdin=None, stdout=PIPE, stderr=None)'+ "<br>" +
  tab2 + '            out, err = self.node_proc.communicate()'+ "<br>" +
  tab2 + '            if out != None and out.decode("utf-8").strip() != "":'+ "<br>" +
  tab3 + '                log.info("Output is:" + out.decode("utf-8"))'+ "<br>" +
  tab3 + '                outlines = out.decode("utf-8").strip().split("\\n")'+ "<br>" +
  tab3 + '                port_out = outlines[1].split()[-1]'+ "<br>" +
  tab3 + '                log.info("PID is:" + port_out)'+ "<br>" +
  tab3 + '                kill_cmd = "rsh " + node_ip + " -l " + node_user + " " + \'"TASKKILL /F /PID \' + port_out + \'"\''+ "<br>" +
  tab3 + '                log.info("KILL COMMAND IS:" + kill_cmd)'+ "<br>" +
  tab3 + '                self.node_proc = subprocess.Popen(kill_cmd, shell=True, stdin=None, stdout=None, stderr=None, close_fds=True)'+ "<br>" +
  tab2 + '            log.info("<<<<<<<<<<<< Waiting for 50 seconds for selenium node to kill >>>>>>>>>>>>>>") '+ "<br>" +
  tab2 + '            time.sleep(50)       '+ "<br>" +
  tab2 + '            log.info("<<<<<<<<<<<< Selenium Node Stopped Successfully >>>>>>>>>>>>>>")        '+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + '    def execute_rsh_command(self, command_to_run):'+ "<br>" +
  tab1 + '        log.info("**********************command to run ***********************")'+ "<br>" +
  tab1 + '        log.info(command_to_run)'+ "<br>" +
  tab1 + '        self.rsh_proc = subprocess.Popen(command_to_run, shell=True, stdin=None, stdout=PIPE, stderr=None)'+ "<br>" +
  tab1 + '        out, err = self.rsh_proc.communicate()'+ "<br>" +
  tab1 + '        outlines = []'+ "<br>" +
  tab1 + '        errorlines = []'+ "<br>" +
  tab1 + '        if out != None and out.decode("utf-8").strip() != "":'+ "<br>" +
  tab2 + '            outlines = out.decode("utf-8").strip()'+ "<br>" +
  tab2 + '            log.info("Output is:", outlines)'+ "<br>" +
  tab1 + '        if err != None and err.decode("utf-8").strip() != "":'+ "<br>" +
  tab2 + '            errorlines = err.decode("utf-8").strip()'+ "<br>" +
  tab2 + '            log.info("Output is:", errorlines)'+ "<br>" +
  tab1 + '        return outlines, errorlines        '+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + ''+ "<br>" +
  tab + '    def login(self):'+ "<br>" +
  tab1 + '        browser = self.testbed.get_browser_details()'+ "<br>" +
  tab1 + '        platform = self.testbed.get_platform_details()'+ "<br>" +
  tab1 + '        environment = self.testbed.get_environment_details()'+ "<br>" +
  tab1 + '        url = self.testbed.get_url_details()'+ "<br>" +
  tab1 + '        log.info("Browser  : " + browser)'+ "<br>" +
  tab1 + '        log.info("Platform  : " + platform)            '+ "<br>" +
  tab1 + '        log.info("Launching " + url)'+ "<br>" +
  tab1 + '        selenium_dict = self.testbed.get_selenium_details()'+ "<br>" +
  tab1 + '        self.download_path = selenium_dict["node"]["selenium_node_path_to_jar"]'+ "<br>" +
  tab1 + '        log.info("Download path :  " + selenium_dict["node"]["selenium_node_path_to_jar"])'+ "<br>" +
  tab1 + '        if environment == "REMOTE":'+ "<br>" +
  tab2 + '            if browser.lower() == "chrome":'+ "<br>" +
  tab3 + '                self.chrome_options = webdriver.ChromeOptions()                    '+ "<br>" +
  tab3 + '                # for download location'+ "<br>" +
  tab3 + '                self.chrome_options.add_experimental_option("prefs", {\'download.prompt_for_download\': False})'+ "<br>" +
  tab3 + '                self.chrome_options.add_experimental_option("prefs", {\'download.default_directory\': self.download_path})'+ "<br>" +
  tab3 + '                self.driver = webdriver.Remote(command_executor = \'http://\' + selenium_dict["hub"]["selenium_hub_ip"]+\':\' +selenium_dict["hub"]["selenium_hub_port"] + \'/wd/hub\',desired_capabilities=self.chrome_options.to_capabilities())'+ "<br>" +
  tab2 + '            elif browser.lower() == "firefox":'+ "<br>" +
  tab3 + '                self.profile = webdriver.FirefoxProfile()'+ "<br>" +
  tab3 + '                self.profile.set_preference("network.cookie.cookieBehavior", 2)'+ "<br>" +
  tab3 + '                # for download location'+ "<br>" +
  tab3 + '                self.profile.set_preference("browser.download.folderList", 2)'+ "<br>" +
  tab3 + '                self.profile.set_preference("browser.download.manager.showWhenStarting", False)'+ "<br>" +
  tab3 + '                self.profile.set_preference("browser.download.dir", self.download_path)'+ "<br>" +
  tab3 + '                self.profile.set_preference("browser.helperApps.neverAsk.saveToDisk", "text/csv,application/x-msexcel,application/excel,application/x-excel,application/vnd.ms-excel,image/png,image/jpeg,text/html,text/plain,application/msword,application/xml")'+ "<br>" +
  tab3 + '                self.driver = webdriver.Remote(desired_capabilities={"browserName": browser,"platform": platform,}, browser_profile=self.profile)'+ "<br>" + "<br>" +
  tab2 + '        else:'+ "<br>" +
  tab3 + '            if browser.lower() == "chrome" :'+ "<br>" +
  tab4 + '                self.driver = webdriver.Chrome()'+ "<br>" +
  tab3 + '            elif browser.lower() == "firefox" :'+ "<br>" +
  tab4 + '                self.driver = webdriver.Firefox()'+ "<br>" +
  tab3 + '            else:'+ "<br>" +
  tab4 + '                log.info(browser + "Browser is not supported")'+ "<br>" +
  tab4 + '                raise'+ "<br>" +
  tab1 + '        self.driver.get(url)'+ "<br>" +
  tab1 + '        self.driver.maximize_window();'+ "<br>" +
  tab1 + '        self.driver.implicitly_wait(5) # seconds'+ "<br>" +
  tab1 + '        return self.driver'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + '    def load_data(self, fileName, driver=None):'+ "<br>" +
  tab1 + '        yamlFile = open(fileName, "r")'+ "<br>" +
  tab1 + '        dataSet = yaml.load(yamlFile)'+ "<br>" +
  tab1 + '        if driver != None:'+ "<br>" +
  tab2 + '            self.actions = ActionChains(driver)'+ "<br>" +
  tab1 + '        log.info(dataSet)'+ "<br>" +
  tab1 + '        return dataSet'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + ''+ "<br>" +
  tab + '    def success_print(self, message):'+ "<br>" +
  tab1 + '        log.info(message)'+ "<br>" +
  tab1 + '        return True'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + '    def assert_equal(self, actual, expected, error_message=None, success_message=None):'+ "<br>" +
  tab1 + '        error_message = "Assertion Failed : Actual value : " + str(actual) + " , Expected Value : " + str(expected) + ", Error Message : " + str(error_message)'+ "<br>" +
  tab1 + '        success_message = "Assertion Passed : Actual value : " + str(actual) + " , Expected Value : " + str(expected) + ", Success Message : " + str(success_message)'+ "<br>" +
  tab1 + '        assert actual == expected and self.success_print(success_message), error_message'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + ''+ "<br>" +
  tab + '    def capture_failure(self, driver, log, testcasename):'+ "<br>" +
  tab1 + '        log_path = easypy.runtime'+ "<br>" +
  tab1 + '        log.info(log_path)'+ "<br>" +
  tab1 + '        filename = testcasename + ".png"'+ "<br>" +
  tab1 + '        screen_path = os.path.join(log_path.directory , filename)'+ "<br>" +
  tab1 + '        driver.save_screenshot(screen_path)'+ "<br>" +
  tab1 + '        msg = "Failed message"'+ "<br>" +
  tab1 + '        initial_url = "http://earms-trade.cisco.com/tradeui/imageViewer?fn="'+ "<br>" +
  tab1 + '        archive = log_path.archive'+ "<br>" +
  tab1 + '        archive = archive.lstrip("/")'+ "<br>" +
  tab1 + '        archive = archive.split("/")'+ "<br>" +
  tab1 + '        req_url = "/"'+ "<br>" +
  tab1 + '        zip_file = archive[-1]'+ "<br>" +
  tab1 + '        zip_file_split = zip_file.split(".")'+ "<br>" +
  tab1 + '        req_date = zip_file_split[1]'+ "<br>" +
  tab1 + '        s = time.strptime(req_date, "%Y%b%d_%H:%M:%S")'+ "<br>" +
  tab1 + '        req_time = time.strftime(\'%Y/%m/%d/%H/%M/\', s)'+ "<br>" +
  tab1 + '        req_time = req_time.replace(\'/\', \'%2F\')'+ "<br>" +
  tab1 + '        zip_file = zip_file.replace(\':\', \'%3A\')'+ "<br>" +
  tab1 + '        final_url = initial_url + filename + "&archive=" + req_time + zip_file'+ "<br>" +
  tab1 + '        message = \'<img src=%s alt="Failure Message">\' % (final_url)'+ "<br>" +
  tab1 + '        log.info(message)'+ "<br>" +
  tab1 + '        log.info(final_url)'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + '    def get_data_count(self, data_values, data):'+ "<br>" +
  tab1 + '        data_dict = {}'+ "<br>" +
  tab1 + '        for i in range(len(list(data_values.keys()))):'+ "<br>" +
  tab2 + '            data_dict[list(data_values.keys())[i]] = len(data_values[list(data_values.keys())[i]])'+ "<br>" +
  tab1 + '        count = []'+ "<br>" +
  tab1 + '        for i in range(data_dict.get(data)):'+ "<br>" +
  tab2 + '            count.append(i)'+ "<br>" +
  tab1 + '        return count'+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + '    def get_testcase_names(self, data_values, data):'+ "<br>" +
  tab1 + '        testcase_list = []'+ "<br>" +
  tab1 + '        for i in range(len(data_values[data])):'+ "<br>" +
  tab2 + '            testcase_list.append(data_values[data][i]["testCase"])'+ "<br>" +
  tab1 + '        return testcase_list'+ "<br>" + "<br>" +
  tab + ' '+ "<br>" +
  tab + '    def istanbul_code_coverage(self, driver, file_name):'+ "<br>" +
  tab1 + '        data = driver.execute_script(\'return window.__coverage__\')'+ "<br>" +
  tab1 + '        log.info("waiting for 10 sec to coverage tool to run")'+ "<br>" +
  tab1 + '        time.sleep(10)'+ "<br>" +
  tab1 + '        coverage_file_name = "../codecoverage/" + "coverage_" + file_name + ".json"'+ "<br>" +
  tab1 + '        log.info(coverage_file_name)'+ "<br>" + "<br>" +
  tab1 + '        if data is not None:'+ "<br>" +
  tab2 + '            with open(coverage_file_name, \'w\') as f:'+ "<br>" +
  tab3 + '                json.dump(data, f)'+ "<br>" +
  tab1 + '        else:'+ "<br>" +
  tab2 + '            log.info("Coverage cant be calculated  as Instrumention code is not availabe")        '+ "<br>" + "<br>" +
  tab + ''+ "<br>" +
  tab + ''+ "<br>" +
  'class MyException(Exception):'+ "<br>" +
  tab + '    def __init__(self, value):'+ "<br>" +
  tab1 + '        self.value = value'+ "<br>" +
  tab + ''+ "<br>" +
  tab + '    def __str__(self):'+ "<br>" +
  tab1 + '        return repr(self.value)'; + "<br>"
    
    
  lib_window = window.open("lib_window","com_MyDomain_lib")
  // To Clear the content each time
  lib_window.document.write('');
  lib_window.document.write(htmlBody)
  lib_window.document.write(libDocumentContentStart)
}

function printServerDetails()
{
  htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Server Detail FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 4em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";
  
  tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
  tab1 = tab + tab
  tab2 = tab + tab + tab 
  tab3 = tab + tab + tab + tab
  tab4 = tab + tab + tab + tab + tab
  tab5 = tab + tab + tab + tab + tab + tab

if(localStorage.url == undefined)
  localStorage.url = ""

  var deviceYamlDocumentContentStart = '# Save YAML file job\\device.yaml' + "<br>" + "<br>" +
    '#Sample Yaml  file'+ "<br>" +  "<br>" +
    'SELENIUM_SERVER_2:'+ "<br>" +
    tab + '  browser: "chrome"'+ "<br>" +
    tab + '  platform: "WINDOWS"'+ "<br>" +
    tab + '  environment: "REMOTE"'+ "<br>" +
    tab + '  url: "' + localStorage.url +  "\"<br>" +
    tab + '  hub:'+ "<br>" +
    tab1 + '    selenium_hub_path_to_jar: "/users/saimathe/Downloads/"'+ "<br>" +
    tab1 + '    selnium_hub_jar_name: "selenium-server-standalone-2.50.1.jar"'+ "<br>" +
    tab1 + '    selenium_hub_ip: "10.104.105.62"'+ "<br>" +
    tab1 + '    selenium_hub_port: "4444"'+ "<br>" +
    tab1 + '    hub_username: root'+ "<br>" +
    tab1 + '    hub_password: "cisco123" '+ "<br>" +
    tab1 + '    hub_scp_ip: "9.40.5.50"   '+ "<br>" +
    tab + '  node:'+ "<br>" +
    tab1 + '    selenium_node_ip: "10.104.105.100"'+ "<br>" +
    tab1 + '    selenium_node_jar_name: "selenium-server-standalone-2.53.0.jar"'+ "<br>" +
    tab1 + '    selenium_node_path_to_jar: "C:/Users/Administrator/Downloads/"'+ "<br>" +
    tab1 + '    selenium_node_user: "Administrator"'+ "<br>" +
    tab1 + '    selenium_node_password: "cisco123"'+ "<br>" +
    tab1 + '    selenium_node_port: "5555"'; "<br>"
  
    
  device_window = window.open("device_yaml_window","com_MyDomain_device")
  // To Clear the content each time
  device_window.document.write('');
  device_window.document.write(htmlBody)
  device_window.document.write(deviceYamlDocumentContentStart)
}
  
 
function printJob()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var currentTestName  = currentClassName.toLowerCase() +"_test.py"
 
  htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Job FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 2em; }" +
  "tab1 { padding-left: 4em; }" +
  "</style></head><body>";

  var jobDocumentContentStart = "# Please Save this File as job\\" +
  currentClassName.toLowerCase() + "_job.py" +"</br></br>" + 
   '   import os </br> '  +
   '   from ats.easypy import run </br> '  +
   '   import sys </br> '  +
   '   sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) </br> '  +
   '   from library.lib import FlexLib </br> '  +
   '     </br>'  +
   '     </br> '  +
   '     </br> '  +
   '   for i in range(len(sys.argv)):  </br>'  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;if "config_file" in sys.argv[i]:  </br> '  +
   '           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.environ["TESTBED"] = sys.argv[i+1]  </br>'  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;elif "ctlr" in sys.argv[i]:  </br>'  +
   '           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.environ["CTLR"] = sys.argv[i+1]  </br>'  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;elif "selenium_server" in sys.argv[i]:  </br>'  +
   '           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.environ["SELENIUM_SERVER"] = sys.argv[i+1]  </br>'  +
   '     </br>'  +
   //'   flex_lib_obj = FlexLib()  </br>'  +
   //'   version = flex_lib_obj.get_version()  </br>'  +
   //'   #setting the version of the device  </br>'  +
   //'   os.environ["DEVICE_VERSION"] = version  </br>'  +
   '     </br>'  +
   '     </br>'  +
   '     </br>'  +
   '   # All run() must be inside a main function  </br>'  +
   '   def main():  </br>'  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;# Find the location of the script in relation to the job file  </br> '  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;test_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  </br>'  +
   "       &nbsp;&nbsp;&nbsp;&nbsp;testscript = os.path.join(test_path, \"testcase\","+
           "'" + currentTestName + "')"+
           "  </br>"  +
   '     </br>'  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;# Execute the testscript  </br>'  +
   '       &nbsp;&nbsp;&nbsp;&nbsp;run(testscript=testscript)  </br>'  +
   '    ' ;
 
 
 
  job_window = window.open("job_window","com_MyDomain_job")
  job_window.document.write('');  
  job_window.document.write(htmlBody)
  job_window.document.write(jobDocumentContentStart)
  
}
 
function printDataFileForManual()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Data FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
 "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 1em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";

  var dataFileStart = "# Please Save this File as dataset\\" +
  currentClassName.toLowerCase() + ".yaml" +"</br></br>" + 
  sessionStorage.pageName + '_operation:</br>'+' &nbsp;&nbsp;-</br>'
  data_window = window.open("data_window","com_MyDomain_data")
  data_window.document.write('');  
  data_window.document.write(htmlBody)
  if(sessionStorage.addNewScenario == "false")
  {
    data_window.document.write(dataFileStart)
    var temp = '  &nbsp;&nbsp;&nbsp;&nbsp;testCase: "' + sessionStorage.pageName  +"_operation_test" + '"<br><br>'
    sessionStorage.dataDocumentContentManual = sessionStorage.dataDocumentContentManual.replace(temp,"")
    sessionStorage.dataDocumentContentManual = sessionStorage.dataDocumentContentManual +   '  &nbsp;&nbsp;&nbsp;&nbsp;testCase: "' + sessionStorage.pageName  +"_operation_test" + '"<br><br>';
  }
  data_window.document.write(sessionStorage.dataDocumentContentManual) 
}
 
 
function printDataFile()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Data FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
 "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 1em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";

  var dataFileStart = "# Please Save this File as " +
  currentClassName.toLowerCase() + ".yaml" +"</br></br>"
 
  generateDataFIle()
  data_window = window.open("data_window","com_MyDomain_data")
  data_window.document.write('');  
  data_window.document.write(htmlBody)
  data_window.document.write(dataFileStart)  
  data_window.document.write(dataDocumentContent)
   
}

function generateDataFileForManual(labelName,elem)
{

  var tab = ""
  var tab1 = "&nbsp;&nbsp;&nbsp;&nbsp;"
  var tab2 = tab1 + tab1
  var tab3 = tab1 + tab1 + tab1

  // Code for start For Loop
  if(sessionStorage.setLoop && sessionStorage.setLoop == "true")
  {
    // code for 
    //sessionStorage.setLoop = "continue"
    sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + tab1 + labelName + "_data:</br>" + tab1 +"-</br>"
    tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab1 = tab + tab
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1   
    tab = tab + tab  

  }
  if(sessionStorage.setLoop && sessionStorage.setLoop == "continue")
  {
    tab = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab1 = tab + tab
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1   
    tab = tab + tab  
  }

  if(sessionStorage.endLoop && sessionStorage.endLoop == "true")
  {
    sessionStorage.setLoop = "false"
    sessionStorage.endLoop = "false"
    tab = ""
    tab1 = "&nbsp;&nbsp;&nbsp;&nbsp;"
    tab2 = tab1 + tab1
    tab3 = tab1 + tab1 + tab1
  }

    sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + tab1 + labelName + ": \""+ getElementValue(elem) +"\"</br>"

}
 
function updateDataFileForManual(elem,custom)
{ 
   var elementTest = findElement(sessionStorage.currentElementlocator,custom)
   //console.log(" elementTest : " , elementTest )
   //console.log(" elem : " , elem )
   
     if(elem && sessionStorage.currentElementLabel && elementTest && (elementTest == elem))
     {
      //console.log("Ele : " , elem)
      //console.log("sessionStorage.currentElementLabel : " , sessionStorage.currentElementLabel)
        sessionStorage.dataDocumentContentManual = sessionStorage.dataDocumentContentManual.substring(0, sessionStorage.dataDocumentContentManual.lastIndexOf((sessionStorage.currentElementLabel+":")));
        sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + sessionStorage.currentElementLabel  + ": \""+ getElementValue(elem) +"\"</br>"
     }
}

function generateDataFIle()
{
  var allFunctionAndData = generateFunction(FunctionAnil)
  dataDocumentContent = ""
  for(var i=0;i<allFunctionAndData.length;i++)
  {
     var temp = allFunctionAndData[i]
     var nameOfData = temp[1][0] 
     var dataArray = temp[2]
     //nameOfData = nameOfData.replace("self.","")
     nameOfData = nameOfData.replace("(driver,data)","")
     dataDocumentContent = dataDocumentContent + nameOfData + ':</br>'+' &nbsp;&nbsp;-</br>'

      for(var j=0;j<dataArray.length;j++)
      {
        dataDocumentContent  =  dataDocumentContent +"&nbsp;&nbsp;&nbsp;&nbsp;" + dataArray[j][0] + ": \""+ getElementValue(dataArray[j][3]) +"\"</br>"
        //dataDocumentContent  =  dataDocumentContent +"&nbsp;&nbsp;&nbsp;&nbsp;" + getElementValue(dataArray[j][3]) + ": \"Dummy\"</br>"
      }
      dataDocumentContent = dataDocumentContent +   '  &nbsp;&nbsp;&nbsp;&nbsp;testCase: "' + nameOfData  +"_test" + '"<br><br>';

  }
  console.log(dataDocumentContent)
}

function getElementValue(elementV)
{
  if (elementV != null)
   {
       elementNodeType = elementV.nodeName.toLowerCase()    
       if (elementNodeType == "span")
            return elementV.innerText
       if (elementNodeType == "input")
       {
          elementType = elementV.type
          if (elementType == 'text')
              return elementV.value
          if (elementType == 'password')
              return elementV.value
          if (elementType == 'submmit')
              return "Yes"
          if (elementType == 'checkbox')
              return elementV.checked
          if (elementType == 'select')
              return elementV.options[elementV.selectedIndex].text
        }
        if (elementNodeType == "select")
        {
          if(elementV.options[elementV.selectedIndex])
              return elementV.options[elementV.selectedIndex].text
            else
              return ""
        }
        else
        {
          return elementV.innerText.trim()
        }
    }
 
   return null
 
}
 
function printSpecFile()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var currentTestMethodName  = currentClassName.toLowerCase() +"_operation_test"
  var specClassName  = currentClassName + "Testcases"
  var currentTestDataName  = currentClassName.toLowerCase() +"_operation"
  var currentVerifyMethodName  = "verify_" + currentClassName.toLowerCase() + "_operation"
  var currentPageFileName  = currentClassName.toLowerCase()
 
  var htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Spec FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 1em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";

  var specDocumentContentStart = "# Please Save this File as " +
  currentClassName.toLowerCase() + "_test.py" +"</br></br>"+
  "__author__ = 'vnagaman' </br>"+
  '#!/bin/env python </br>'+
  '# To get a logger for the script</br>'+
  'import logging</br>'+
  ''+
  '# Needed for aetest script</br>'+
  'from ats import aetest</br>'+
  'from selenium import webdriver</br>'+
  'import time</br>'+
  'from script.'+ currentPageFileName +' '+
  'import *</br>'+
  'import yaml</br>'+
  'from library.lib import *</br>'+
  'import traceback</br>'+
  '</br></br>'+
  '# Get your logger for your script</br>'+
  'log = logging.getLogger(__name__)</br></br>'+
  ''+
  'flexlib_obj = FlexLib()</br>'+
  'dataValues = flexlib_obj.load_yaml_file(os.path.basename(__file__), os.path.dirname(os.path.dirname(os.path.abspath(__file__))))</br>'+
  '</br>'+
  '</br>'+
  'class ' + specClassName + '(aetest.Testcase):</br>'+
  '    &nbsp;&nbsp""" This is user Testcases section """</br></br>'+
  ''+
  '    &nbsp;&nbsp;# This is how to create a setup section</br>'+
  '    &nbsp;&nbsp;@aetest.setup</br>'+
  '    &nbsp;&nbsp;def prepare_testcase(self, section):</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;""" Testcase Setup section """</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.get_version()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("Preparing the test")</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;self.obj = ' +  currentClassName + '()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.stop_selenium_server()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.start_selenium_server()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;self.driver = self.obj.login()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("subtest setup")</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;log.info(section)</br>'

  var temp = generateSpec()
  specDocumentContentStart = specDocumentContentStart + temp
  spec_window = window.open("spec_window","com_MyDomain_spec")
  spec_window.document.write('');    
  spec_window.document.write(htmlBody)
  spec_window.document.write(specDocumentContentStart)
}


function printSpecFileForManual()
{
 
  currentClassName = capitalize(sessionStorage.pageName)
  var currentTestMethodName  = currentClassName.toLowerCase() +"_operation_test"
  var specClassName  = currentClassName + "Testcases"
  var currentTestDataName  = currentClassName.toLowerCase() +"_operation"
  var currentVerifyMethodName  = "verify_" + currentClassName.toLowerCase() + "_operation"
  var currentPageFileName  = currentClassName.toLowerCase()
 
  var htmlBody = "<html><head><meta charset=\"UTF-8\"><title>Spec FIle </title>"+
  "<style>"+
  "table{"+
  "border-collapse:"+
  "collapse;border: 5px solid black;"+
  "width: 100%;"+
  "}"+
  "td{"+
  "width: 25%;height: 2em;border: 2px solid black;"+
  "}"+
  "button {"+
  "background-color: #555555; /* Green */" +
  "border: 1;" +
  "color: white;"+
  "padding: 15px 32px;"+
  "text-align: center;"+
  "text-decoration: none;"+
  "display: inline-block;"+
  "font-size: 13px;"+
  "margin: 31px 97px;"+
  "}"+
  "tab { padding-left: 1em; }" +
  "tab1 { padding-left: 2em; }" +
  "</style></head><body>";

  var specDocumentContentStartManual = "# Please Save this File as testcase\\" +
  currentClassName.toLowerCase() + "_test.py" +"</br></br>"+
  "__author__ = 'vnagaman' </br>"+
  '#!/bin/env python </br>'+
  '# To get a logger for the script</br>'+
  'import logging</br>'+
  ''+
  '# Needed for aetest script</br>'+
  'from ats import aetest</br>'+
  'from selenium import webdriver</br>'+
  'import time</br>'+
  'from script.'+ currentPageFileName +' '+
  'import *</br>'+
  'import yaml</br>'+
  'from library.lib import *</br>'+
  'import traceback</br>'+
  '</br></br>'+
  '# Get your logger for your script</br>'+
  'log = logging.getLogger(__name__)</br></br>'+
  ''+
  'flexlib_obj = FlexLib()</br>'+
  'dataValues = flexlib_obj.load_yaml_file(os.path.basename(__file__), os.path.dirname(os.path.dirname(os.path.abspath(__file__))))</br>'+
  '</br>'+
  '</br>'+
  'class ' + specClassName + '(aetest.Testcase):</br>'+
  '    &nbsp;&nbsp""" This is user Testcases section """</br></br>'+
  ''+
  '    &nbsp;&nbsp;# This is how to create a setup section</br>'+
  '    &nbsp;&nbsp;@aetest.setup</br>'+
  '    &nbsp;&nbsp;def prepare_testcase(self, section):</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;""" Testcase Setup section """</br>'+
  //'        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.get_version()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("Preparing the test")</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;self.obj = ' +  currentClassName + '()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.stop_selenium_server()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.start_selenium_server()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;self.driver = flexlib_obj.login()</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("subtest setup")</br>'+
  '        &nbsp;&nbsp;&nbsp;&nbsp;log.info(section)</br>'

  
  specDocumentContentStartManual  =  specDocumentContentStartManual  + '&nbsp;&nbsp;&nbsp;&nbsp;self.' + sessionStorage.pageName + '_operation' + '_dataSet = dataValues["' + sessionStorage.pageName + '_operation' + '"]</br>'

   var nameOfData = sessionStorage.pageName + '_operation'
  specDocumentContentStartManual  =  specDocumentContentStartManual  + 
    '</br>'+
    '</br>'+
    '&nbsp;&nbsp;#@aetest.skipIf((flexlib_obj.current_version() in ["skip_verison"]), \'Not supported\')</br>'+
    '    &nbsp;&nbsp;@aetest.loop(count=flexlib_obj.get_data_count(dataValues, "' + nameOfData + '"), ids=flexlib_obj.get_testcase_names(dataValues, "'+ nameOfData + '"))</br>'+
    '    &nbsp;&nbsp;@ aetest.test</br>'+
    '    &nbsp;&nbsp;def '+sessionStorage.pageName + '_operation_test(self, count):</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;""" add description about the test """</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;try:</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data = self.' + sessionStorage.pageName + '_operation_dataSet[count]</br>'

    
    specDocumentContentStartManual  =  specDocumentContentStartManual + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.' + sessionStorage.pageName +'_operation(self.driver,data)' + '</br>' 
    specDocumentContentStartManual =  specDocumentContentStartManual  + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.verify_' + sessionStorage.pageName +'_operation(self.driver,data)' + '</br>' 


    specDocumentContentStartManual  =  specDocumentContentStartManual  +
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info("Subtest test")</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;except Exception as e:</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info("Exception Occured - %s" % (traceback.format_exc().splitlines()))</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.capture_failure(self.driver, log, data["testCase"])</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.failed("Exception Occured - %s" % e)</br></br></br>'

  specDocumentContentStartManual =  specDocumentContentStartManual  +
    '    &nbsp;&nbsp;# This is how to create a cleanup section</br>'+
    '    &nbsp;&nbsp;@aetest.cleanup</br>'+
    '    &nbsp;&nbsp;def clean_testcase(self):</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;""" Testcase cleanup section """</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("Pass testcase cleanup")</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.istanbul_code_coverage(self.driver, "' + sessionStorage.pageName.toLowerCase() + '")</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;self.driver.quit()</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.stop_selenium_server()</br>'+
    '</br></br>'+
    'if __name__ == \'__main__\':  # pragma: no cover</br>'+
    '    &nbsp;&nbsp;aetest.main()</br>';

  spec_window = window.open("spec_window","com_MyDomain_spec")
  spec_window.document.write('');    
  spec_window.document.write(htmlBody)
  spec_window.document.write(specDocumentContentStartManual)
} 


function generateSpecForManual() 
{

   var nameOfData = sessionStorage.pageName + '_operation'
  sessionStorage.specDocumentContentForManual  =  sessionStorage.specDocumentContentForManual  + 
    '</br>'+
    '</br>'+
    '&nbsp;&nbsp;@aetest.skipIf((flexlib_obj.current_version() in ["skip_verison"]), \'Not supported\')</br>'+
    '    &nbsp;&nbsp;@aetest.loop(count=flexlib_obj.get_data_count(dataValues, "' + nameOfData + '"), ids=flexlib_obj.get_testcase_names(dataValues, "'+ nameOfData + '"))</br>'+
    '    &nbsp;&nbsp;@ aetest.test</br>'+
    '    &nbsp;&nbsp;def '+sessionStorage.pageName + '_operation_test(self, count):</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;""" add description about the test """</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;try:</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data = self.' + sessionStorage.pageName + '_dataSet[count]</br>'

    
    sessionStorage.specDocumentContentForManual  =  sessionStorage.specDocumentContentForManual  + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.' + sessionStorage.pageName +'_operation' + '</br>' 
    sessionStorage.specDocumentContentForManual  =  sessionStorage.specDocumentContentForManual  + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.verify_' + sessionStorage.pageName +'_operation' + '</br>' 


    sessionStorage.specDocumentContentForManual  =  sessionStorage.specDocumentContentForManual  +
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info("Subtest test")</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;except Exception as e:</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info("Exception Occured - %s" % (traceback.format_exc().splitlines()))</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.capture_failure(self.driver, log, data["testCase"])</br>'+
    '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.failed("Exception Occured - %s" % e)</br></br></br>'

  sessionStorage.specDocumentContentForManual  =  sessionStorage.specDocumentContentForManual  +
    '    &nbsp;&nbsp;# This is how to create a cleanup section</br>'+
    '    &nbsp;&nbsp;@aetest.cleanup</br>'+
    '    &nbsp;&nbsp;def clean_testcase(self):</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;""" Testcase cleanup section """</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("Pass testcase cleanup")</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.istanbul_code_coverage(self.driver, "' + sessionStorage.pageName.toLowerCase() + '")</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;self.driver.quit()</br>'+
    '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.stop_selenium_server()</br>'+
    '</br></br>'+
    'if __name__ == \'__main__\':  # pragma: no cover</br>'+
    '    &nbsp;&nbsp;aetest.main()</br>';

}

function generateSpec() 
{
  var allFunctionAndData = generateFunction(FunctionAnil)
  var specDocumentContentStart = "" 

  for(var i=0;i<allFunctionAndData.length;i++)
    {
       var temp = allFunctionAndData[i]
       var nameOfData = temp[1][0] 
       nameOfData = nameOfData.replace("self.","")
       nameOfData = nameOfData.replace("(driver,data)","")
       specDocumentContentStart  =  specDocumentContentStart + '&nbsp;&nbsp;&nbsp;&nbsp;self.' + nameOfData + '_dataSet = dataValues["' + nameOfData + '"]</br>'
    } 


  for(var i=0;i<allFunctionAndData.length;i++)
    {
       var temp = allFunctionAndData[i]
       var nameOfData = temp[1][0] 
       var functionArray = temp[1]
       nameOfData = nameOfData.replace("self.","")
       nameOfData = nameOfData.replace("(driver,data)","")
       var currentTestMethodName = nameOfData + "_test"
       specDocumentContentStart  =  specDocumentContentStart + 
        '</br>'+
        '</br>'+
        '&nbsp;&nbsp;@aetest.skipIf((flexlib_obj.current_version() in ["skip_verison"]), \'Not supported\')</br>'+
        '    &nbsp;&nbsp;@aetest.loop(count=flexlib_obj.get_data_count(dataValues, "' + nameOfData + '"), ids=flexlib_obj.get_testcase_names(dataValues, "'+ nameOfData + '"))</br>'+
        '    &nbsp;&nbsp;@ aetest.test</br>'+
        '    &nbsp;&nbsp;def '+currentTestMethodName + '(self, count):</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;""" add description about the test """</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;try:</br>'+
        '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data = self.' + nameOfData + '_dataSet[count]</br>'

        for(var j=0;j<functionArray.length;j++)
        {
           var temp = functionArray[j]
           temp = temp.replace("driver","self.driver")
           specDocumentContentStart =  specDocumentContentStart + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.' + temp + '</br>' 
        }

        specDocumentContentStart =  specDocumentContentStart +
        '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info("Subtest test")</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;except Exception as e:</br>'+
        '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;log.info("Exception Occured - %s" % (traceback.format_exc().splitlines()))</br>'+
        '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.obj.capture_failure(self.driver, log, data["testCase"])</br>'+
        '            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.failed("Exception Occured - %s" % e)</br></br></br>'
    } // for loop end

    specDocumentContentStart =  specDocumentContentStart +
        '    &nbsp;&nbsp;# This is how to create a cleanup section</br>'+
        '    &nbsp;&nbsp;@aetest.cleanup</br>'+
        '    &nbsp;&nbsp;def clean_testcase(self):</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;""" Testcase cleanup section """</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;log.info("Pass testcase cleanup")</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.istanbul_code_coverage(self.driver, "' + currentClassName.toLowerCase() + '")</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;self.driver.quit()</br>'+
        '        &nbsp;&nbsp;&nbsp;&nbsp;flexlib_obj.stop_selenium_server()</br>'+
        '</br></br>'+
        'if __name__ == \'__main__\':  # pragma: no cover</br>'+
        '    &nbsp;&nbsp;aetest.main()</br>';

  return specDocumentContentStart

}

function elementChanged(custom)
{
if (currentElement.nodeName.toLowerCase() != "html" && currentElement.nodeName.toLowerCase() != "body" && currentElement.nodeName.toLowerCase() != "li" && currentElement.nodeName.toLowerCase() != "image" && currentElement.nodeName.toLowerCase() != "circle" && currentElement.nodeName.toLowerCase() != "form" && isValidElement(currentElement))
  {
   if (previousElement != currentElement)
    {
      previousElement = currentElement
      previousElementEventType = currentElementEventType
      elementIDs  = findAllPossibleLocator(currentElement,custom.view.document)
      preferedID = preferedLocator(elementIDs,currentElement)
      console.log("prefered Locator ID : " , Object.values(preferedID)[0])
      console.log("elementIDs : " , elementIDs)
      console.log("preferedID : " , preferedID)
      if(sessionStorage.setRecordVerify && sessionStorage.setRecordVerify == "true")
        printHTMLBodyForManualVerification(window_handle,preferedID,currentElementEventType,currentElement,custom)
      else
        printHTMLBody(window_handle,preferedID,currentElementEventType,currentElement,custom)
    }
    else
    {    
      elementIDs  = findAllPossibleLocator(currentElement,custom.view.document)
      preferedID = preferedLocator(elementIDs,currentElement)
      console.log("Existing prefered Locator ID : " , Object.values(preferedID)[0])
      console.log("Existing elementIDs : " , elementIDs)
      console.log("Existing preferedID : " , preferedID)
      updateHTMLBody(window_handle,preferedID,currentElementEventType,currentElement,custom)
      previousElementEventType = currentElementEventType

    }
  }
}

function isValidElement(ele)
{
  if(ele.innerText)
  {
    // If the clicked element contain multiple line , then dont allow it 
    a = ele.textContent.replace(/^\s+|\s+$/g, "")
    if (a.indexOf("\n") == -1)
      return true
    else
      return false
  }
  else
  {
    return true
  }
}
function contextMenuChanged(custom)
{
  if(currentContextElement && currentContextElement.nodeName.toLowerCase() != "html" && currentContextElement.nodeName.toLowerCase() != "li")
    {
      if(sessionStorage.setVerify == "true"  || sessionStorage.setTime5 == "true" || sessionStorage.setTime10 == "true") 
      {
        elementIDs  = findAllPossibleLocator(currentContextElement,custom)
        preferedID = preferedLocator(elementIDs,currentContextElement)
        //console.log("contextMenuChanged elementIDs : " , Object.values(preferedID)[0])
        //console.log("contextMenuChanged elementIDs : " , elementIDs)
        //console.log("contextMenuChanged preferedID : " , preferedID)
        printContextMenu(window_handle,preferedID,currentContextElement,custom)
      }
    }
}

function frameChanged()
{

 if(typeof(sessionStorage.currentFrame) != "undefined" && sessionStorage.currentFrame.length > 0 &&  (sessionStorage.previousFrame != sessionStorage.currentFrame))
  {
    sessionStorage.previousFrame = sessionStorage.currentFrame
  return true 
  }
  return false
}
  
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
 
 
function isElementAllowed(e) {
  tagsToIgnore = ["span" , "div"]
  lookForAttribute  = ["link" , "button" , "toggle-slider" , "select" , "aria-owns" , "ng-click"]
 
  if ( e.nodeName !=null &&  e.nodeName.length > 0 && tagsToIgnore.includes(e.nodeName.toLowerCase()))
  {
    for(var index=0;index<lookForAttribute.length;index)
    {
      if (elementContainAttribute(e,lookForAttribute[index]) !=null)
        return e
    }
    return null  
  }
 
  return e  
}
 
function getElementsByTagArray(custom,elementIndexToInsert)
{
 
  // If elementIndexToInsert is present then this is the insert order else add element to end of list
  elementIndexToInsert =  currentClickedElementIndex || maintainOrderForElementsActual.length ;
 
  //var tagNameArray = ["input" , "textarea" , "button" , "select", "a"  , "link", "ul" , "ol" , "table" ]
  //var tagNameArray = ["button", "input" , "textarea" , "select", "a" , "table" ,"li" ]
 
  //var tagNameArray = ["input" , "textarea" , "button"]
  var tagNameArray = ["input" , "textarea" , "button" , "table" , "a"]
  //var tagNameArray = ["button" , "div"]
 
 
  var tagName = ""
 
  if (tagNameArray.length > 0)
  {
 
     for(var tagIndex=0;tagIndex<tagNameArray.length;tagIndex++)
     {
        tagName = tagNameArray[tagIndex]
        elementsBySearchedTag = custom.getElementsByTagName(tagName)       
        if (elementsBySearchedTag.length > 0)
        {
            for(var index=0;index<elementsBySearchedTag.length;index++)
            {
                presentElement = elementsBySearchedTag[index]
                // This change is for Tab restriction
                if (isVisible(presentElement) && !isTab(presentElement))
                  setOfElements.add(presentElement)
            }
        }
      }
  }
 
  updateActualElements(custom,elementIndexToInsert)
 
}
 
 
// Need to delete ignored elements , which we dont want to record.
function deleteIgnoredElements(custom)
{
   
    //Polaris   
    //var ignoreSection  = ['[ng-show="loggedIn"]' , '[ng-hide="hideMegamenu"]' , "th" , '[id="testDiv"]' , '[kendo-button="showDiffWindowCancelButton"]','[kendo-window="preferenceWindow"]' , '[kendo-window="supportedBrowsersWindow"]' , '[kendo-window="showDiffWindow"]']
   
    var ignoreSection  = ['[id="header_form"]' ,'[ng-controller="dashLeftPanel"]', '[ng-init="addClass=false"]','[data-role="pager"]' , '[ng-show="loggedIn"]' , '[ng-hide="hideMegamenu"]' , '[ng-include="dashLeftPanel.html"]' , "th" ,'[kendo-button="showDiffWindowCancelButton"]','[kendo-window="preferenceWindow"]' , '[kendo-window="supportedBrowsersWindow"]' , '[kendo-window="showDiffWindow"]' ,'[ng-click="sendFeedback()"]','[ng-click="feedbackWindow.close()"]' , '[class="starRating"]' ,'[id="visual"]']
 
    //ME
    //var ignoreSection  = [ '[id="header_form"]' ,'[ng-controller="dashLeftPanel"]', '[ng-init="addClass=false"]','[data-role="pager"]' , '[ng-show="loggedIn"]' , '[ng-hide="hideMegamenu"]' , '[ng-include="dashLeftPanel.html"]' , "th" ]
   
    for(var i=0;i<ignoreSection.length;i++)
    {
       var getAllElementWithIgnored  = custom.querySelectorAll(ignoreSection[i]);
       //var tempAllVisibleElemenets = getArrayOfVisibleElements(getAllElementWithIgnored)
      
 
       for(var j=0;j<getAllElementWithIgnored.length;j++)
       {
          // Get all elements from this element
          var temp2 = getAllElementWithIgnored[j].querySelectorAll("*");
          for (var k=0;k<temp2.length;k++)
           {
              if(setOfElements.has(temp2[k]))
                setOfElements.delete(temp2[k])
           }
 
           // if the temp2 is the element to delete , like we are not intrested in child
           if (setOfElements.has(getAllElementWithIgnored[j]))
              setOfElements.delete(getAllElementWithIgnored[j])
         
       }   
 
    }
    //console.log("After Delete " ,setOfElements )
   
}
 
// Not using it , can delete it
function sortByButton(a)
{
  var temp = []
  for(var i=0;i<a.length ;i++){
      if(a[i][1].nodeName.toLowerCase() == "button")
          temp.push(a[i])
  }
 
  for(var i=0;i<a.length ;i++){
      if(a[i][1].nodeName.toLowerCase() != "button")
          temp.push(a[i])
  }
 
  return temp
}
 
// Not using it , can delete it
function sortByTab(a)
{
  var temp = []
  for(var i=0;i<a.length ;i++){
      if(a[i][1].hasAttribute("class") && a[i][1].attributes["class"] == "k-link")
          temp.push(a[i])
  }
 
  for(var i=0;i<a.length ;i++){
      if(!(a[i][1].hasAttribute("class") && a[i][1].attributes["class"] == "k-link"))
          temp.push(a[i])
  }
  return temp
}
 
function isTabAndSelected(ele)
{
    if(ele.hasAttribute("class") && ele.attributes["class"].value == "k-link" && ele.hasAttribute("aria-selected"))
      return true
    return false
}
 
function isTab(ele)
{
    if((ele.hasAttribute("class") && ele.attributes["class"].value == "k-link") || (ele.hasAttribute("role") && ele.attributes["role"].value == "tab"))
      return true
    return false
}
 
// Not using it , can delete it
function reArrangeElements(a)
{
  var temp = []
  var temp1 = []
 
  for(var i=0;i<a.length ;i++)
  {
      if(a[i][1].nodeName.toLowerCase() == "button" && (a[i][1].innerText.toLowerCase().indexOf("close") != -1  || a[i][1].innerText.toLowerCase().indexOf("apply") != -1 || a[i][1].innerText.toLowerCase().indexOf("cancel") != -1 || a[i][1].innerText.toLowerCase().indexOf("delete") != -1))
           temp.push(a[i])
      else if(a[i][1].nodeName.toLowerCase() == "a" && ( a[i][1].innerText.toLowerCase().indexOf("close") != -1  || a[i][1].innerText.toLowerCase().indexOf("apply") != -1 || a[i][1].innerText.toLowerCase().indexOf("cancel") != -1))
            temp.push(a[i])
      else
            temp1.push(a[i])
  }
 
  //Push it at back
  for(var i =0;i<temp.length;i++)
    temp1.push(temp[i])
 
  return temp1
}
 
 
// Not using it , can delete it
function reArrangeElementsByTab(a)
{
  var temp = []
  var temp1 = []
 
  for(var i=0;i<a.length ;i++)
  {
      if(a[i][1].nodeName.toLowerCase() == "span" && a[i][1])
           temp.push(a[i])
      else if(a[i][1].nodeName.toLowerCase() == "a" && ( a[i][1].innerText.toLowerCase().indexOf("close") != -1  || a[i][1].innerText.toLowerCase().indexOf("apply") != -1 || a[i][1].innerText.toLowerCase().indexOf("cancel") != -1 ))
            temp.push(a[i])
      else
            temp1.push(a[i])
  }
 
  //Push it at back
  for(var i =0;i<temp.length;i++)
    temp1.push(temp[i])
 
  return temp1
}
 
 
 
 
function getArrayOfVisibleElements(allElemenets)
{
    var temp = []
    for(var i=0;i<allElemenets.length;i++)
    {
       if(isVisible(allElemenets[i]))
          temp.push(allElemenets[i])
    }
 
    return temp
}
 
function updateActualElements(custom,elementIndexToInsert)
{
 
  //console.log(setOfElements)
  deleteIgnoredElements(custom)
  for(var presentElement of setOfElements)
  {
      elementIDs  = findAllPossibleLocator(presentElement,custom)
      preferedID = preferedLocator(elementIDs,presentElement)
    
      if (preferedID != undefined)
      {
          actualLocatorValue  = preferedID[Object.keys(preferedID)[0]]
          //if( !(actualLocatorValue in elementIDsArrayActualMap) && isVisible(presentElement))
            if( !(actualLocatorValue in elementIDsArrayActualMap))
            {
                elementIDsArrayActualMap[actualLocatorValue] = "no"
                // Locator , Actual Element
                temp = [actualLocatorValue,presentElement]
                maintainOrderForElementsActual.insert(elementIndexToInsert,temp)
            }
      }
    }
 
      // Sort by button
  maintainOrderForElementsActual = sortByButton(maintainOrderForElementsActual)
 
  //Add all Apply , cancel , close to end to list
  maintainOrderForElementsActual = reArrangeElements(maintainOrderForElementsActual)
 
  //Sort by tab
  //maintainOrderForElementsActual = sortByTab(maintainOrderForElementsActual)
 
  //console.log(maintainOrderForElementsActual)
 
}
 
function getElementsByAttribute(custom,elementIndexToInsert)
{
 
  // If elementIndexToInsert is present then this is the insert order else add element to end of list
  elementIndexToInsert =  currentClickedElementIndex || maintainOrderForElementsActual.length ;
 
  //var attNameArray = ['[ng-click]' , '[onclick]' , '[aria-owns]' , '[class="toggle-slider"]' , '[class="k-link"]', '[btn-toggle]','[class="k-slider-wrap"]' ]
  var attNameArray = ['[ng-click]' , '[onclick]' , '[aria-owns]' , '[class="toggle-slider"]' , '[class="k-link"]', '[btn-toggle]','[class="k-slider-wrap"]' ]
  var attName = ""
 
   for(var tagIndex=0;tagIndex<attNameArray.length;tagIndex++)
   {
      attName = attNameArray[tagIndex]
      elementsBySearchedAttribute = custom.querySelectorAll(attName);
     
      if (elementsBySearchedAttribute.length > 0)
      {
          for(var index=0;index<elementsBySearchedAttribute.length;index++)
          {
              var presentElement = elementsBySearchedAttribute[index]
              // This change is for Tab restriction
              if (isVisible(presentElement) && !isTab(presentElement))
                setOfElements.add(presentElement)
          }
      }
    }
    updateActualElements(custom,elementIndexToInsert)
}
 
function navigateHelper()
{
 
  var temp = []; // An new empty array
  for (var i = 0, len = mantainElementWithPageNameArray.length; i < len; i++) {
      temp[i] = mantainElementWithPageNameArray[i];
  }
 
  // Remove Duplicate Entry
  console.log("Before REmoving: " , temp  )
  for(var i =0; i<temp.length;i++)
    {
      ref = temp[i]["pageName"]
      for(var j = i+1; j<temp.length;j++)
      {
        ref1 = temp[j]["pageName"]
        if(ref == ref1)
        {
          temp.splice(j, 1);
          j = j-1
        }
      }
    }  
 
    console.log("After REmoving: " , temp  )
}
 
 
function isVisible(e)
{
    return e !=null && (!!( e.offsetWidth || e.offsetHeight || e.getClientRects().length ));
}
 
 
 
// NOT WORKING
function checkForAllowedAnchorTag(e)
{
 
    var classFlag  = false ;
    var hrefFlag  = false ;
    if ((e.hasAttribute("class")) && (e.attributes["class"].value.length > 0))
    {
        var classAttValue = e.attributes["class"].value
        if((classAttValue.indexOf("k-grid-add" )) != -1)
        {
          classFlag = true
        }
        else if((classAttValue.indexOf("k-grid-edit" )) != -1){
          classFlag = true
        }      
        else if((classAttValue.indexOf("k-grid-delete" )) != -1)
        {
          classFlag = true
        }
        else if((classAttValue.indexOf("k-grid-update" )) != -1)
        {
          classFlag = true         
        }
    }
 
    if ((e.hasAttribute("href")) && (e.attributes["href"].value.length) > 0)
    {
        var hrefAttValue = e.attributes["href"].value
        if(hrefAttValue == "#")
        {
          hrefFlag = true    
        }
 
        else if(hrefAttValue == "javascript://")
        {
          hrefFlag = false
        }
 
    }
 
    if (classFlag == true && hrefFlag == true && e.innerText.length >0)
    //if (classFlag == true && hrefFlag == true )
    {
      return true  
    }
    else
    {
      return false
    }
}
 
function clickOnVisibleElement(index,custom)
{
  //for(var key in elementIDsArrayActualMap)
  if(index<maintainOrderForElementsActual.length)
    {
      var key = maintainOrderForElementsActual[index][0]
      if(elementIDsArrayActualMap[key] == 'no')
      {
            elementF = findElement(key,custom)
            //if (elementF !=null)
            // This code is specific to Tab restriction  
            if (elementF !=null && isVisible(elementF))
            {
              //if ((elementF.nodeName.toLowerCase() == "a") &&  elementF.hasAttribute("href"))  // For Polaris
                if (isTab(elementF) || ((elementF.nodeName.toLowerCase() == "a") && (!checkForAllowedAnchorTag(elementF))))  // For ME
                {
                    //update value to yes
                    elementIDsArrayActualMap[key] = "yes"
                    findAllElements(++index,custom);
                }
                else
                {
                    elementF.click();
                    
                    setTimeout(function(){
                 
                    current_index = allElementsArray[allElementsArray.indexOf(elementF)].index
                    currentIncrementCounter = getCurrentCounter(current_index)
 
                    // Index the Elements to mentain the sequency
                    indexAllElements(custom)
 
                    elementIDsArrayActualMap[key] = "yes"
                    currentClickedElementIndex = index
                    findAllElements(++index,custom);
                    console.log(index)
                    },500);
                }
                
            }else{
                findAllElements(++index,custom);
                                                       }
          }else{
                findAllElements(++index,custom);
                             }
      }
      else
      {
        printAllElementAfterProcessForAuto(custom)
      }
  }
 
function findCountForClickedElements()
{
   //check if all elements covered
  var yesCount = 0
  for(var key in elementIDsArrayActualMap)
    {
        if(elementIDsArrayActualMap[key] == 'yes')
        {
           yesCount = yesCount + 1
        }
    }
    return yesCount
}
 
var elementIDsArrayActualMap = new Object();
var maintainOrderForElementsActual = []
var setOfElements = new Set();
//var elementIDsLocatorMap = new Object();
//var setOfElementsToPrint = new Set();
var mantainElementWithPageNameArray = []
 
 
function findAllElements(index,custom)
{
  getElementsByTagArray(custom)
  getElementsByAttribute(custom)
 
  initialCount  = Object.keys(elementIDsArrayActualMap).length
 
  finalCount = Object.keys(elementIDsArrayActualMap).length
 
  clickOnVisibleElement(index,custom)
 
  if (initialCount == finalCount)
  {
    return
  }
 
  //check if all elements covered
  if(Object.keys(elementIDsArrayActualMap).length == findCountForClickedElements())
  {
    return null
  }
 
}
 
 
function printAllElementAfterProcessForAuto(custom)
{
  var tempArray = new Array()
  var indexOfElement = 0

   for(var setOfElementsToPrint of setOfElements)
   {
      for(var i=0;i<allElementsArray.length;i++)
      {
        if (allElementsArray[i] == setOfElementsToPrint)
        {
          indexOfElement = allElementsArray[i].index
          break
        }
      }
      
      elementIDs  = findAllPossibleLocator(setOfElementsToPrint,custom)
      preferedID = preferedLocator(elementIDs,setOfElementsToPrint,custom)
      //console.log(setOfElementsToPrint)
      //console.log(" elementIDs : " ,elementIDs)
      //console.log(" preferedID : " ,preferedID)
      if (preferedID!=undefined)
      {
              var temp = new Object();
              var t = [preferedID,setOfElementsToPrint]
              temp[indexOfElement] = t
              tempArray.push(temp)
      }
      else
      {
          console.log(setOfElementsToPrint)
          console.log("Not able to generate any ID")
      }
   }


   // remove duplicate elements if any , depending on the locator value 
  for(var i =0; i<tempArray.length;i++)
  {
    ref = Object.values(tempArray[i])[0]
    ref = Object.values(ref[0])[0]
    for(var j = i+1; j<tempArray.length;j++)
    {
      ref1 = Object.values(tempArray[j])[0]
      ref1 = Object.values(ref1[0])[0]
      if(ref == ref1)
      {
        tempArray.splice(j, 1);
        j = j-1
      }
    }
  }     

  // remove duplicate elements if any both locator points to same
 for(var i =0; i<tempArray.length;i++)
  {
    ref = Object.values(tempArray[i])[0]
    ref = Object.values(ref[0])[0]
    ele = Object.values(tempArray[i])[0][1]
    for(var j = i+1; j<tempArray.length;j++)
    {
      ref1 = Object.values(tempArray[j])[0]
      ref1 = Object.values(ref1)[0]
      ele1 = Object.values(tempArray[j])[0][1]
      
      if(ele !=null && ele1 !=null && (ele.parentNode == ele1 || ele1.parentNode == ele))
      {
        tempArray.splice(j, 1);
        j = j-1
      }
    }
  }     

   // sort the array based on index number 
   tempArray = tempArray.sort(function(a, b){return Object.keys(a)[0] - Object.keys(b)[0]});
   
   for(var index=0;index<tempArray.length ; index ++ )
   {
       preferedID = tempArray[index][Object.keys(tempArray[index])][0]
       eleActual = tempArray[index][Object.keys(tempArray[index])][1]
       //console.log("eleActual : " , eleActual)
       //console.log("preferedID : " ,preferedID)

       currentElementEventType = "click"
       printHTMLBody(window_handle,preferedID,currentElementEventType,eleActual,custom)
   }

}

 
function AutoBuild()
{
 
  var elem = window.document.documentElement;
 
  //set window confirm / alert as true
  window.confirm = function () { return true }
  window.alert = function () { return true }
 
  //elem.addEventListener('keypress', handler);
  elem.addEventListener('click', handler);
  //elem.addEventListener('mousedown', handler);
 
 
  function handler(event)
  {
    currentElementEventType = event.type
    currentElement = event.srcElement ;
    var baseUrl = event.srcElement.baseURI.toLowerCase();
    generatePageName(baseUrl)
    currentPageAddress = baseUrl.substring((baseUrl.lastIndexOf("#") + 1))
    console.log("......... Identifying Elements, Please Wait Few Seconds .......... ")
  }
 
findAllElements(0,window.document)

window_handle = printHTMLHeader()
printHTMLFooter(window_handle)

// Add click event to buttons
window_handle.document.getElementById("downloadData").addEventListener("click", printDataFile);
window_handle.document.getElementById("downloadScript").addEventListener("click", printScript);
window_handle.document.getElementById("downloadSpec").addEventListener("click", printSpecFile);
window_handle.document.getElementById("downloadLocator").addEventListener("click", printLocator);
window_handle.document.getElementById("downloadJob").addEventListener("click", printJob);

console.log("*********  Executtion Completed ********* ")

}

 function isValidMacAddress(macAdd) 
 {
  var RegExPattern = /^[0-9a-fA-F:]+$/;
 
  if (!(macAdd.match(RegExPattern)) || macAdd.length != 17) 
  {
    return false
  }
  else
  {
    return true
  }
 }
  


function findAllWindow()
{
  //var arr = new Array()
  var arr = new Map()
  function findAllFrames(win,arr)
  {
    if(win.frames.length > 0)
    {
      for(var index=0;index<win.frames.length;index++)
      {
        var temp = {}
        //temp[win.frames[index].name]  = win.frames[index]
        //arr.push(temp)
        try
          {
          if(win.frames[index].name)
          {
            try {
            arr[win.frames[index].name]  = win.frames[index]
            }
            catch(err) {
              console.log("error happened for frame Name")
              break
            }
        }
        else if(win.frames[index].frameElement && win.frames[index].frameElement.id)
        {
            try {
            arr[win.frames[index].frameElement.id]  = win.frames[index]
            }
            catch(err) {
              console.log("error happened for frame id")
              break
            }

        }
        }
        catch(err)
         {
            console.log("error happened for frame Name/ID")
            console.log(win.frames[index])
            break
       }
   
        findAllFrames(win.frames[index],arr)
      }
    }
  }
  findAllFrames(top.frames,arr)
  return arr
}
var allFrames = new Object();
var allFrameElements = []
var currentFrame = ""
var previousFrame = ""

function addEventsToAllFrames()
{
  allFrames = findAllWindow()
  if (Object.values(allFrames).length > 0){
    for(var i=0;i<Object.values(allFrames).length;i++){
      var frameWindow = Object.values(allFrames)[i]
      var elem = frameWindow.document.documentElement;
      if (typeof(elem.keypressEvent) == "undefined"){
          elem.keypressEvent = "true"
          elem.addEventListener('keyup', handler, true);
      }
      if (typeof(elem.mousedownEvent) == "undefined"){
          elem.mousedownEvent = "true"
          elem.addEventListener('mousedown', handler, true);
      }
      if (typeof(elem.contextmenuEvent) == "undefined"){
          elem.contextmenuEvent = "true"
          elem.addEventListener('contextmenu', contextmenuEventHandler, true);
      }      
      //if (typeof(elem.focusoutEvent) == "undefined"){
          //elem.focusoutEvent = "true"
          //elem.addEventListener('focusout', focusoutEventHandler);
      //}
      if (typeof(elem.mousemoveEvent) == "undefined"){
          elem.mousemoveEvent = "true"
          elem.addEventListener('mousemove', mousemoveEventHandler, true);
      }
      if(frameWindow && frameWindow.document && frameWindow.document.body){
          var s = frameWindow.document.createElement('script');
          //s.innerHTML = "alert = function(){sessionStorage.popUpInfo = 'true';return true}"
          s.innerHTML = "(function() {var _old_alert = window.alert;window.alert = function() {_old_alert.apply(window,arguments);console.log('alert message : ' , arguments[0]);sessionStorage.alert = 'true';sessionStorage.alert_message = arguments[0];console.log('alert Present')};})();"
          frameWindow.document.body.appendChild(s);



          var s = frameWindow.document.createElement('script');
          //s.innerHTML = "alert = function(){sessionStorage.popUpInfo = 'true';return true}"
          s.innerHTML = "(function() {var _old_confirm = window.confirm;window.confirm = function() {var flag = _old_confirm.apply(window,arguments);console.log('Flag Value :', flag);console.log('Message Value :', arguments[0]);sessionStorage.confirm = 'true';sessionStorage.confirm_message = arguments[0];sessionStorage.confirm_status= flag;};})();"
          frameWindow.document.body.appendChild(s);
      }
  } 
  }

  var elem = window.document.documentElement;
  if (typeof(elem.keypressEvent) == "undefined"){
      elem.keypressEvent = "true"
      elem.addEventListener('keyup', handler, true);
  }
  if (typeof(elem.mousedownEvent) == "undefined"){
      elem.mousedownEvent = "true"
      elem.addEventListener('mousedown', handler, true);
  }
  if (typeof(elem.contextmenuEvent) == "undefined"){
      elem.contextmenuEvent = "true"
      elem.addEventListener('contextmenu', contextmenuEventHandler, true);
  }
  //if (typeof(elem.focusoutEvent) == "undefined"){
      //elem.focusoutEvent = "true"
      //elem.addEventListener('focusout', focusoutEventHandler);
  //}
  if (typeof(elem.mousemoveEvent) == "undefined"){
      elem.mousemoveEvent = "true"
      elem.addEventListener('mousemove', mousemoveEventHandler, true);
  }


  var s = document.createElement('script');
  //s.innerHTML = "alert = function(){sessionStorage.popUpInfo = 'true';return true}"
  s.innerHTML = "(function() {var _old_alert = window.alert;window.alert = function() {_old_alert.apply(window,arguments);console.log('alert message : ' , arguments[0]);sessionStorage.alert = 'true';sessionStorage.alert_message = arguments[0];console.log('alert Present')};})();"
  document.body.appendChild(s);



  var s = document.createElement('script');
  //s.innerHTML = "alert = function(){sessionStorage.popUpInfo = 'true';return true}"
  s.innerHTML = "(function() {var _old_confirm = window.confirm;window.confirm = function() {var flag = _old_confirm.apply(window,arguments);console.log('Flag Value :', flag);console.log('Message Value :', arguments[0]);sessionStorage.confirm = 'true';sessionStorage.confirm_message = arguments[0];sessionStorage.confirm_status=flag;return flag;};})();"
  document.body.appendChild(s);

}

function ManualBuild()
{

  // Code for Frame window 
  addEventsToAllFrames()

  sessionStorage.pageName = "DemoClass"
  
  // Code for display Window
  window_handle = printHTMLHeaderForManual()

}

function handler(event) 
 {
    //console.log("Hii : " , event)
    if(event && event.view && isValidElement(event.srcElement))
    {
      // Code for Tab
      if(event.keyCode && event.keyCode == "9")
        currentElementEventType = "click"
      else
        currentElementEventType = event.type


      currentElement = event.srcElement;

      event.srcElement.addEventListener('focusout', focusoutEventHandler);
      event.srcElement.addEventListener('mouseleave', focusoutEventHandler);



      // get the page name
      var baseUrl = event.srcElement.baseURI.toLowerCase();
      generatePageName(baseUrl)
      currentPageAddress = baseUrl.substring((baseUrl.lastIndexOf("#") + 1))
      //console.log("Name : " ,event.view.name )
      if(event.view && event.view.name && event.view.name.length > 0 )
        sessionStorage.currentFrame = event.view.name
      else if(event.view && event.view.frameElement && event.view.frameElement.id && event.view.frameElement.id.length > 0) 
        sessionStorage.currentFrame = event.view.frameElement.id
      else
        sessionStorage.currentFrame = ""
      elementChanged(event)
      // For Tab Issue 
      //updateDataFileForManual(currentElement)
      window.onbeforeunload = function() {
        setTimeout(function(){
                 addEventsToAllFrames()
                        //console.log("Wait 500 mili seconds")
                      },500);
        console.log("Relaoded again .. ")
      }      
    }
    else
    {
      console.log("Not a valid element to process")
      console.log(event.srcElement)
      currentElement = undefined
    }

    // clean up section
    sessionStorage.UsingbyXpathUsingContains = ""
 }

function contextmenuEventHandler(event) 
{
    currentContextElement = event.srcElement;
}

function mousemoveEventHandler(event) 
{
    var userDefinedClassName = window_handle.document.getElementById("userDefinedClassName").value;
    sessionStorage.addNewScenario = window_handle.document.getElementById("addNewScenario").checked;
    if(userDefinedClassName && userDefinedClassName.length > 0)
      sessionStorage.pageName = userDefinedClassName
    
    contextMenuChanged(event.view.document)
}


function focusoutEventHandler(event) 
{
  updateTabValue()

  updateDataFileForManual(currentElement,event.view.document)

  // Code for Pop Up / Alert
  if(typeof(sessionStorage.alert) != "undefined" && sessionStorage.alert == 'true'){
    currentElement = null
      // Generate Alert code
      var alertLableValue = updateLabelName("message","message")

      sessionStorage.alert = "false"
      sessionStorage.functionContentManual = sessionStorage.functionContentManual + tab + generateAlertCode(alertLableValue)

      sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + tab1 + alertLableValue + ": \""+ sessionStorage.alert_message + "\"</br>"

      printHTMLBodyAlert(alertLableValue,sessionStorage.alert_message)
    }
  if(typeof(sessionStorage.confirm) != "undefined" && sessionStorage.confirm == 'true'){
    currentElement = null
       var confirmLableValue = updateLabelName("message","message")

      // Generate Alert code
      sessionStorage.confirm = "false"
      sessionStorage.functionContentManual = sessionStorage.functionContentManual + tab + generateConfirmCode(sessionStorage.confirm_status,confirmLableValue)
      sessionStorage.dataDocumentContentManual  =  sessionStorage.dataDocumentContentManual + tab1 + confirmLableValue + ": \""+ sessionStorage.confirm_message +"\"</br>"
      printHTMLBodyConfirm(confirmLableValue,sessionStorage.confirm_message,sessionStorage.confirm_status)
    }
}

function checkIsIPV4(entry) {
  var blocks = entry.split(".");
  if(blocks.length === 4) {
    return blocks.every(function(block) {
      return parseInt(block,10) >=0 && parseInt(block,10) <= 255;
    });
  }
  return false;
}

function generatePageName(baseUrl) 
{
  sessionStorage.pageName  = (baseUrl.split("/"))[baseUrl.split("/").length -1]
  if (isValidMacAddress(sessionStorage.pageName))
  {
    sessionStorage.pageName = (baseUrl.split("/"))[baseUrl.split("/").length - 2]
  }

  if(sessionStorage.pageName.indexOf(".html") != -1)
    sessionStorage.pageName = sessionStorage.pageName.replace(".html", "")

  if(sessionStorage.pageName.length > 15 || sessionStorage.pageName.length == 0)
  {
    var page = (baseUrl.split("/"))
    page = page.filter(function(e){return e});
    sessionStorage.pageName = page[1]
    if (checkIsIPV4(sessionStorage.pageName))
      sessionStorage.pageName = "Address_" + sessionStorage.pageName
    sessionStorage.pageName = sessionStorage.pageName.replace(/\./g,"_")
  }

  if(sessionStorage.pageName.length == 0)
    sessionStorage.pageName = "NotAbleToIdentifyPageName"

  var userDefinedClassName = window_handle.document.getElementById("userDefinedClassName").value;
  if(userDefinedClassName && userDefinedClassName.length > 0)
    sessionStorage.pageName = userDefinedClassName


}

AutoBuild()

//ManualBuild()

function getAllParentFrames(custom)
{
  var names  = new Array()
  while(custom && custom.view && custom.view.parent && custom.view.parent.name.length > 0)
  {
  names.push(custom.view.parent.name)
  custom = custom.view.parent
  }

  while(custom && custom.view && custom.view.parent && custom.view.parent.frameElement && custom.view.parent.frameElement.id && custom.view.parent.frameElement.id.length > 0)
  {
  names.push(custom.view.parent.frameElement.id)
  custom = custom.view.parent     
  }
  return names
} 
 
})(); 