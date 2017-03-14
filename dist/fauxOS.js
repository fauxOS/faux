"use strict";function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}function browserInfo(){var ua=navigator.userAgent,matches=ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d.]+)/i)||[];if(/trident/i.test(matches[1])){var tem=ua.match(/\brv[ :]+([\d.]+)/g)||"";return["IE",tem[1]]}if("Chrome"===matches[1]){var _tem=ua.match(/\b(OPR|Edge)\/([\d.]+)/);if(null!=_tem)return["Opera",_tem[1]]}return matches[2]?[matches[1],matches[2]]:[navigator.appName,navigator.appVersion]}function loaded(obj){return eval("typeof "+obj+" !== 'undefined'")}var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}(),faux={name:"faux",processTable:[],fileTable:[],sys:{},fs:void 0,flags:{},utils:{}};if("undefined"!=typeof module&&(module.exports=faux),faux.flags.env={},loaded("navigator")){faux.flags.isBrowser=!0;var info=browserInfo();faux.flags.env.name=info[0],faux.flags.env.version=info[1]}else loaded("process")&&loaded("module")&&loaded("require")?(faux.flags.isNode=!0,faux.flags.env.name="Node.JS",faux.flags.env.version=process.version):console.warn("FauxOS : environment not detected and/or not supported");loaded("Worker")?faux.flags.Worker=!0:faux.flags.isNode?global.Worker=require("webworker-threads").Worker:(faux.flags.Worker=!1,console.warn("FauxOS : Worker not supported")),faux.utils.genUUID=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=16*Math.random()|0,v="x"==c?r:3&r|8;return v.toString(16)})},faux.utils.mkWorker=function(scriptStr){var blob=new Blob([scriptStr],{type:"application/javascript"}),uri=URL.createObjectURL(blob);return new Worker(uri)},faux.utils.loadLocalFile=function(){var input=document.createElement("input");return input.type="file",input.click(),new Promise(function(resolve,reject){input.onchange=function(){resolve(input.files[0])}})},faux.utils.readLocalFile=function(blob){var readAs=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"readAsText",reader=new FileReader;return reader[readAs](blob),new Promise(function(resolve,reject){reader.onloadend=function(){resolve(reader.result)}})},faux.utils.openLocalFile=function(){return loadLocalFile().then(readLocalFile)},faux.flags.isNode?faux.utils.http=function(uri){var request=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"GET",require("request"));return new Promise(function(resolve,reject){request(uri,function(err,res,body){err&&reject(err),res&&body&&resolve(body)})})}:faux.flags.isBrowser?faux.utils.http=function(uri){var method=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"GET";return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest;xhr.open(method,uri,!0),xhr.onload=function(){xhr.status<300&&xhr.status>=200?resolve(xhr.response):reject(xhr.status+" "+xhr.statusText)},xhr.onerror=function(err){reject(err)},xhr.send()})}:(faux.flags.http=!1,console.warn("FauxOS : HTTP not supported"));var Pathname=function(){function Pathname(input){_classCallCheck(this,Pathname),this.input=input,this.clean=this.cleanf(),this.chop=this.chopf(),this.name=this.namef(),this.basename=this.basenamef(),this.parent=this.parentf(),this.extentions=this.extentionsf(),this.segment=this.segmentf()}return _createClass(Pathname,[{key:"cleanf",value:function(){var clean=[],pathArray=this.input.match(/[^\/]+/g);for(var i in pathArray){var name=pathArray[i];"."===name||(".."===name?clean.pop():clean.push(name))}return"/"+clean.join("/")}},{key:"chopf",value:function(){var segments=this.clean.match(/[^\/]+/g);return null===segments?["/"]:segments}},{key:"namef",value:function(){return this.chop[this.chop.length-1]}},{key:"basenamef",value:function(){var name=this.name;if(""===name)return name;var base=name.match(/^[^\.]+/);return null!==base?base[0]:""}},{key:"parentf",value:function(){if("/"===this.name)return null;var parentLen=this.clean.length-this.name.length;return this.clean.slice(0,parentLen)}},{key:"extentionsf",value:function(){return this.name.match(/\.[^\.]+/g)}},{key:"segmentf",value:function(){var pathArray=this.chop,segments=[];if("/"===this.name)segments=["/"];else for(var i=0;i<=pathArray.length;i++){var matchPath=pathArray.slice(0,i);segments.push("/"+matchPath.join("/"))}return segments}}]),Pathname}(),OFS_Inode=function OFS_Inode(){var config=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};_classCallCheck(this,OFS_Inode),this.links=0,Object.assign(this,config)},OFS=function(){function OFS(){_classCallCheck(this,OFS),this.drive=arguments[0]||[new OFS_Inode({links:1,id:0,type:"d",files:{".":0,"..":0}})]}return _createClass(OFS,[{key:"resolveHard",value:function(path){var inode=0,trace=[inode];if(""===path)return this.drive[inode];var pathArray=new Pathname(path).chop;for(var i in pathArray){var name=pathArray[i],inodeObj=this.drive[inode];if(void 0===inodeObj.files)return-1;if(inode=inodeObj.files[name],void 0===inode)return-1;trace.push(inode)}return this.drive[trace.pop()]}},{key:"resolve",value:function(path){var redirectCount=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;if(redirectCount>=50)return-1;var inode=this.resolveHard(path);return inode<0?-1:"sl"===inode.type?(redirectCount++,this.resolve(inode.redirect,redirectCount)):inode}},{key:"addInode",value:function(type){var name=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,parentInode=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(name.match("/"))return-1;var id=this.drive.length;return this.drive[id]=new OFS_Inode({links:1,type:type,id:id}),parentInode instanceof OFS_Inode&&"d"===parentInode.type&&(parentInode.files[name]=id),this.drive[id]}},{key:"mkFile",value:function(path){var pathname=new Pathname(path),parentInode=this.resolve(pathname.parent),name=pathname.name,inode=this.addInode("f",name,parentInode);return inode<0?-1:(inode.data="",inode)}},{key:"mkDir",value:function(path){var pathname=new Pathname(path),parentInode=this.resolve(pathname.parent),name=pathname.name,inode=this.addInode("d",name,parentInode);return inode<0?-1:(inode.files={".":inode.id,"..":parentInode.id},inode)}},{key:"mkLink",value:function(inode,path){var pathname=new Pathname(path),parentInode=this.resolve(pathname.parent),name=pathname.name;return name.match("/")?-1:(parentInode.files[name]=inode.id,inode)}},{key:"mkSymLink",value:function(refPath,linkPath){var pathname=new Pathname(linkPath),parentInode=this.resolve(pathname.parent),name=pathname.name,inode=this.addInode("sl",name,parentInode);if(inode<0)return-1;var path=new Pathname(refPath).clean;return inode.redirect=path,inode}},{key:"rm",value:function(path){var pathname=new Pathname(path),parentInode=this.resolve(pathname.parent),name=pathname.name;return parentInode<0?-1:delete parentInode.files[name]}}]),OFS}(),DOMFS=function(){function DOMFS(){var selectorBase=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";_classCallCheck(this,DOMFS),this.base=selectorBase,this.resolveHard=this.resolve}return _createClass(DOMFS,[{key:"resolve",value:function(path){var pathname=new Pathname(path);if("/"===pathname.chop[0])return document.querySelector("*");var selector=" "+pathname.chop.join(" > ");return selector=selector.replace(/ (\d)/g," :nth-child($1)"),document.querySelector(selector)}}]),DOMFS}(),VFS=function(){function VFS(){_classCallCheck(this,VFS),this.mounts={"/":arguments[0]||new OFS}}return _createClass(VFS,[{key:"mount",value:function(fs,mountPoint){return this.mounts[mountPoint]=fs}},{key:"unmount",value:function(mountPoint){return delete this.mounts[mountPoint]}},{key:"mountPoint",value:function mountPoint(path){var pathname=new Pathname(path),segments=pathname.segment,mounts=Object.keys(this.mounts),resolves=[];for(var i in mounts){var mount=new Pathname(mounts[i]).clean;for(var _i in segments)segments[_i]===mount&&resolves.push(mount)}var mountPoint=resolves.pop();return mountPoint}},{key:"resolve",value:function(path){var resolveHard=arguments.length>1&&void 0!==arguments[1]&&arguments[1],pathname=new Pathname(path),mountPoint=this.mountPoint(pathname.clean),fs=this.mounts[mountPoint],fsLocalPath=pathname.clean.substring(mountPoint.length);return resolveHard?fs.resolveHard(fsLocalPath):fs.resolve(fsLocalPath)}},{key:"type",value:function(path){var container=this.resolve(path);return container instanceof OFS_Inode?"inode":container instanceof HTMLElement?"element":"unknown"}},{key:"rm",value:function(path){var pathname=new Pathname(path),mountPoint=this.mountPoint(pathname.clean),fs=this.mounts[mountPoint];return fs.rm(pathname.clean)}},{key:"mkPath",value:function(type,path){var target=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,pathname=new Pathname(path),mountPoint=this.mountPoint(pathname.clean),fs=this.mounts[mountPoint],addedObj=-1;if("f"===type)addedObj=fs.mkFile(pathname.clean);else if("d"===type)addedObj=fs.mkDir(pathname.clean);else if("l"===type&&null!==target){var targetObj=this.resolve(target);if(targetObj<0)return-1;addedObj=fs.mkLink(targetObj,pathname.clean)}else{if("sl"!==type||null===target)return-1;addedObj=fs.mkSymLink(target,pathname.clean)}return addedObj}},{key:"touch",value:function(path){return this.mkPath("f",path)}},{key:"mkdir",value:function(path){return this.mkPath("d",path)}},{key:"ln",value:function(refPath,linkPath){return this.mkPath("l",linkPath,refPath)}},{key:"lns",value:function(refPath,linkPath){return this.mkPath("sl",linkPath,refPath)}}]),VFS}();faux.fs=new VFS(new OFS([new OFS_Inode({links:1,id:0,type:"d",files:{".":0,"..":0,bin:1,dev:2,etc:3,home:4,lib:5,log:6,mnt:7,tmp:8,usr:9}}),new OFS_Inode({links:1,type:"d",id:1,files:{".":1,"..":0}}),new OFS_Inode({links:1,type:"d",id:2,files:{".":2,"..":0}}),new OFS_Inode({links:1,type:"d",id:3,files:{".":3,"..":0}}),new OFS_Inode({links:1,type:"d",id:4,files:{".":4,"..":0}}),new OFS_Inode({links:1,type:"d",id:5,files:{".":5,"..":0,"lib.js":10}}),new OFS_Inode({links:1,type:"d",id:6,files:{".":6,"..":0}}),new OFS_Inode({links:1,type:"d",id:7,files:{".":7,"..":0}}),new OFS_Inode({links:1,type:"d",id:8,files:{".":8,"..":0}}),new OFS_Inode({links:1,type:"d",id:9,files:{".":9,"..":0}}),new OFS_Inode({links:1,type:"f",id:10,data:'/* lib.js */ "use strict";function newID(){for(var length=arguments.length>0&&void 0!==arguments[0]?arguments[0]:8,chars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",id="",i=0;i<length;i++){var randNum=Math.floor(Math.random()*chars.length);id+=chars.substring(randNum,randNum+1)}return id}function sys(name,args){var id=newID();return postMessage({type:"syscall",name:name,args:args,id:id}),new Promise(function(resolve,reject){self.addEventListener("message",function(msg){msg.data.id===id&&("success"===msg.data.status?resolve(msg.data.result):reject(msg.data.reason))})})}function spawn(image){return sys("spawn",[image])}function open(path){return sys("open",[path])}function read(fd){return sys("read",[fd])}function write(fd,data){return sys("write",[fd,data])} /* endinject */'})])),faux.fs.mount(new DOMFS,"/dev/dom");var FileDescriptor=function(){function FileDescriptor(path){if(_classCallCheck(this,FileDescriptor),this.path=new Pathname(path).clean,this.type=faux.fs.type(this.path),this.container=faux.fs.resolve(this.path),this.container<0)throw new Error("Path Unresolved")}return _createClass(FileDescriptor,[{key:"read",value:function(){if("inode"===this.type){var _data=this.container.data;return null==_data?-1:_data}return"element"===this.type?this.container.innerText:-1}},{key:"write",value:function(data){return"inode"===this.type?this.container.data=data:"element"===this.type?this.container.innerText=data:-1}},{key:"dir",value:function(){if("inode"===this.type)return"f"===this.container.type?Object.keys(this.container.files):null;if("element"===this.type){if(this.container.hasChildNodes()){for(var children=this.container.children,elements=[],i=0;i<children.length;i++){var el=children[i].localName,id=children[i].id,classes=children[i].className.split(" ").join(".");elements.push(el+id+classes),elements.push(i+1)}return elements}return null}return-1}}]),FileDescriptor}(),Process=function(){function Process(execImage){var _this=this;_classCallCheck(this,Process),this.fds=[],this.worker=faux.utils.mkWorker(execImage),this.worker.addEventListener("message",function(msg){_this.messageHandler(msg)})}return _createClass(Process,[{key:"messageHandler",value:function(msg){var obj=msg.data;if("syscall"===obj.type&&obj.name in faux.sys)void 0!==obj.id&&obj.args instanceof Array&&faux.sys[obj.name](this,obj.id,obj.args);else{var error={status:"error",reason:"Invalid request type and/or name",id:obj.id};this.worker.postMessage(error)}}},{key:"open",value:function(path){var fd=new FileDescriptor(path);return this.fds.push(fd),this.fds.length-1}}]),Process}();faux.sys.fail=function(process,msgID,args){var error={status:"error",reason:args[0],id:msgID};process.worker.postMessage(error)},faux.sys.pass=function(process,msgID,args){var result={status:"success",result:args[0],id:msgID};process.worker.postMessage(result)},faux.sys.spawn=function(process,msgID,args){if(1!==args.length)faux.sys.fail(process,msgID,["Should have only 1 argument"]);else{var newProcess=new Process(args[0]),pid=faux.processTable.length;faux.processTable.push(newProcess),faux.sys.pass(process,msgID,[pid])}},faux.sys.open=function(process,msgID,args){if(1!==args.length)faux.sys.fail(process,msgID,["Should have only 1 argument"]);else if("string"!=typeof args[0])faux.sys.fail(process,msgID,["Argument should be a string"]);else{var result=process.open(args[0]);faux.sys.pass(process,msgID,[result])}},faux.sys.read=function(process,msgID,args){if(1!==args.length)faux.sys.fail(process,msgID,["Should have only 1 argument"]);else if(args[0]<0)faux.sys.fail(process,msgID,["File Descriptor should be postive"]);else{var result=process.fds[args[0]].read();faux.sys.pass(process,msgID,[result])}},faux.sys.write=function(process,msgID,args){if(2!==args.length)faux.sys.fail(process,msgID,["Should have 2 arguments"]);else if(args[0]<0)faux.sys.fail(process,msgID,["File Descriptor should be postive"]);else{var result=process.fds[args[0]].write(args[1]);faux.sys.pass(process,msgID,[result])}};