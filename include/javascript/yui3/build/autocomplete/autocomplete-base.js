/*
 Copyright (c) 2010, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 3.3.0
 build: 3167
 */
YUI.add('autocomplete-base',function(Y){var Escape=Y.Escape,Lang=Y.Lang,YArray=Y.Array,YObject=Y.Object,isFunction=Lang.isFunction,isString=Lang.isString,trim=Lang.trim,INVALID_VALUE=Y.Attribute.INVALID_VALUE,_FUNCTION_VALIDATOR='_functionValidator',_SOURCE_SUCCESS='_sourceSuccess',ALLOW_BROWSER_AC='allowBrowserAutocomplete',INPUT_NODE='inputNode',QUERY='query',QUERY_DELIMITER='queryDelimiter',REQUEST_TEMPLATE='requestTemplate',RESULTS='results',RESULT_LIST_LOCATOR='resultListLocator',VALUE='value',VALUE_CHANGE='valueChange',EVT_CLEAR='clear',EVT_QUERY=QUERY,EVT_RESULTS=RESULTS;function AutoCompleteBase(){Y.before(this._bindUIACBase,this,'bindUI');Y.before(this._destructorACBase,this,'destructor');Y.before(this._syncUIACBase,this,'syncUI');this.publish(EVT_CLEAR,{defaultFn:this._defClearFn});this.publish(EVT_QUERY,{defaultFn:this._defQueryFn});this.publish(EVT_RESULTS,{defaultFn:this._defResultsFn});}
AutoCompleteBase.ATTRS={allowBrowserAutocomplete:{value:false},allowTrailingDelimiter:{value:false},inputNode:{setter:Y.one,writeOnce:'initOnly'},maxResults:{value:0},minQueryLength:{value:1},query:{readOnly:true,value:null},queryDelay:{value:100},queryDelimiter:{value:null},requestTemplate:{setter:'_setRequestTemplate',value:null},resultFilters:{setter:'_setResultFilters',value:[]},resultFormatter:{validator:_FUNCTION_VALIDATOR},resultHighlighter:{setter:'_setResultHighlighter'},resultListLocator:{setter:'_setLocator'},results:{readOnly:true,value:[]},resultTextLocator:{setter:'_setLocator'},source:{setter:'_setSource'},tokenInput:{readOnly:true},value:{value:''}};AutoCompleteBase.CSS_PREFIX='ac';AutoCompleteBase.UI_SRC=(Y.Widget&&Y.Widget.UI_SRC)||'ui';AutoCompleteBase.prototype={sendRequest:function(query,requestTemplate){var request,source=this.get('source');if(query||query===''){this._set(QUERY,query);}else{query=this.get(QUERY);}
if(source){if(!requestTemplate){requestTemplate=this.get(REQUEST_TEMPLATE);}
request=requestTemplate?requestTemplate(query):query;source.sendRequest({request:request,callback:{success:Y.bind(this._onResponse,this,query)}});}
return this;},_bindUIACBase:function(){var inputNode=this.get(INPUT_NODE),tokenInput=inputNode&&inputNode.tokenInput;if(tokenInput){inputNode=tokenInput.get(INPUT_NODE);this._set('tokenInput',tokenInput);}
if(!inputNode){Y.error('No inputNode specified.');return;}
this._inputNode=inputNode;this._acBaseEvents=[inputNode.on(VALUE_CHANGE,this._onInputValueChange,this),inputNode.on('blur',this._onInputBlur,this),this.after(ALLOW_BROWSER_AC+'Change',this._syncBrowserAutocomplete),this.after(VALUE_CHANGE,this._afterValueChange)];},_destructorACBase:function(){var events=this._acBaseEvents;while(events&&events.length){events.pop().detach();}},_syncUIACBase:function(){this._syncBrowserAutocomplete();this.set(VALUE,this.get(INPUT_NODE).get(VALUE));},_createArraySource:function(source){var that=this;return{sendRequest:function(request){that[_SOURCE_SUCCESS](source.concat(),request);}};},_createFunctionSource:function(source){var that=this;return{sendRequest:function(request){that[_SOURCE_SUCCESS](source(request.request)||[],request);}};},_createObjectSource:function(source){var that=this;return{sendRequest:function(request){var query=request.request;that[_SOURCE_SUCCESS](YObject.owns(source,query)?source[query]:[],request);}};},_functionValidator:function(value){return value===null||isFunction(value);},_getObjectValue:function(obj,path){if(!obj){return;}
for(var i=0,len=path.length;obj&&i<len;i++){obj=obj[path[i]];}
return obj;},_parseResponse:function(query,response,data){var facade={data:data,query:query,results:[]},listLocator=this.get(RESULT_LIST_LOCATOR),results=[],unfiltered=response&&response.results,filters,formatted,formatter,highlighted,highlighter,i,len,maxResults,result,text,textLocator;if(unfiltered&&listLocator){unfiltered=listLocator(unfiltered);}
if(unfiltered&&unfiltered.length){filters=this.get('resultFilters');textLocator=this.get('resultTextLocator');for(i=0,len=unfiltered.length;i<len;++i){result=unfiltered[i];text=textLocator?textLocator(result):result.toString();results.push({display:Escape.html(text),raw:result,text:text});}
for(i=0,len=filters.length;i<len;++i){results=filters[i](query,results.concat());if(!results){return;}
if(!results.length){break;}}
if(results.length){formatter=this.get('resultFormatter');highlighter=this.get('resultHighlighter');maxResults=this.get('maxResults');if(maxResults&&maxResults>0&&results.length>maxResults){results.length=maxResults;}
if(highlighter){highlighted=highlighter(query,results.concat());if(!highlighted){return;}
for(i=0,len=highlighted.length;i<len;++i){result=results[i];result.highlighted=highlighted[i];result.display=result.highlighted;}}
if(formatter){formatted=formatter(query,results.concat());if(!formatted){return;}
for(i=0,len=formatted.length;i<len;++i){results[i].display=formatted[i];}}}}
facade.results=results;this.fire(EVT_RESULTS,facade);},_parseValue:function(value){var delim=this.get(QUERY_DELIMITER);if(delim){value=value.split(delim);value=value[value.length-1];}
return Lang.trimLeft(value);},_setLocator:function(locator){if(this[_FUNCTION_VALIDATOR](locator)){return locator;}
var that=this;locator=locator.toString().split('.');return function(result){return result&&that._getObjectValue(result,locator);};},_setRequestTemplate:function(template){if(this[_FUNCTION_VALIDATOR](template)){return template;}
template=template.toString();return function(query){return Lang.sub(template,{query:encodeURIComponent(query)});};},_setResultFilters:function(filters){var acFilters,getFilterFunction;if(filters===null){return[];}
acFilters=Y.AutoCompleteFilters;getFilterFunction=function(filter){if(isFunction(filter)){return filter;}
if(isString(filter)&&acFilters&&isFunction(acFilters[filter])){return acFilters[filter];}
return false;};if(Lang.isArray(filters)){filters=YArray.map(filters,getFilterFunction);return YArray.every(filters,function(f){return!!f;})?filters:INVALID_VALUE;}else{filters=getFilterFunction(filters);return filters?[filters]:INVALID_VALUE;}},_setResultHighlighter:function(highlighter){var acHighlighters;if(this._functionValidator(highlighter)){return highlighter;}
acHighlighters=Y.AutoCompleteHighlighters;if(isString(highlighter)&&acHighlighters&&isFunction(acHighlighters[highlighter])){return acHighlighters[highlighter];}
return INVALID_VALUE;},_setSource:function(source){var sourcesNotLoaded='autocomplete-sources module not loaded';if((source&&isFunction(source.sendRequest))||source===null){return source;}
switch(Lang.type(source)){case'string':if(this._createStringSource){return this._createStringSource(source);}
Y.error(sourcesNotLoaded);return INVALID_VALUE;case'array':return this._createArraySource(source);case'function':return this._createFunctionSource(source);case'object':if(Y.JSONPRequest&&source instanceof Y.JSONPRequest){if(this._createJSONPSource){return this._createJSONPSource(source);}
Y.error(sourcesNotLoaded);return INVALID_VALUE;}
return this._createObjectSource(source);}
return INVALID_VALUE;},_sourceSuccess:function(data,request){request.callback.success({data:data,response:{results:data}});},_syncBrowserAutocomplete:function(){var inputNode=this.get(INPUT_NODE);if(inputNode.get('nodeName').toLowerCase()==='input'){inputNode.setAttribute('autocomplete',this.get(ALLOW_BROWSER_AC)?'on':'off');}},_updateValue:function(newVal){var delim=this.get(QUERY_DELIMITER),insertDelim,len,prevVal;newVal=Lang.trimLeft(newVal);if(delim){insertDelim=trim(delim);prevVal=YArray.map(trim(this.get(VALUE)).split(delim),trim);len=prevVal.length;if(len>1){prevVal[len-1]=newVal;newVal=prevVal.join(insertDelim+' ');}
newVal=newVal+insertDelim+' ';}
this.set(VALUE,newVal);},_afterValueChange:function(e){var delay,fire,minQueryLength,newVal=e.newVal,query,that;if(e.src!==AutoCompleteBase.UI_SRC){this._inputNode.set(VALUE,newVal);return;}
minQueryLength=this.get('minQueryLength');query=this._parseValue(newVal)||'';if(minQueryLength>=0&&query.length>=minQueryLength){delay=this.get('queryDelay');that=this;fire=function(){that.fire(EVT_QUERY,{inputValue:newVal,query:query});};if(delay){clearTimeout(this._delay);this._delay=setTimeout(fire,delay);}else{fire();}}else{clearTimeout(this._delay);this.fire(EVT_CLEAR,{prevVal:e.prevVal?this._parseValue(e.prevVal):null});}},_onInputBlur:function(e){var delim=this.get(QUERY_DELIMITER),delimPos,newVal,value;if(delim&&!this.get('allowTrailingDelimiter')){delim=Lang.trimRight(delim);value=newVal=this._inputNode.get(VALUE);if(delim){while((newVal=Lang.trimRight(newVal))&&(delimPos=newVal.length-delim.length)&&newVal.lastIndexOf(delim)===delimPos){newVal=newVal.substring(0,delimPos);}}else{newVal=Lang.trimRight(newVal);}
if(newVal!==value){this.set(VALUE,newVal);}}},_onInputValueChange:function(e){var newVal=e.newVal;if(newVal===this.get(VALUE)){return;}
this.set(VALUE,newVal,{src:AutoCompleteBase.UI_SRC});},_onResponse:function(query,e){if(query===this.get(QUERY)){this._parseResponse(query,e.response,e.data);}},_defClearFn:function(){this._set(QUERY,null);this._set(RESULTS,[]);},_defQueryFn:function(e){var query=e.query;this.sendRequest(query);},_defResultsFn:function(e){this._set(RESULTS,e[RESULTS]);}};Y.AutoCompleteBase=AutoCompleteBase;},'3.3.0',{optional:['autocomplete-sources'],requires:['array-extras','base-build','escape','event-valuechange','node-base']});