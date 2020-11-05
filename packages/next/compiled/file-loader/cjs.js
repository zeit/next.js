module.exports=function(e,t){"use strict";var i={};function __webpack_require__(t){if(i[t]){return i[t].exports}var r=i[t]={i:t,l:false,exports:{}};e[t].call(r.exports,r,r.exports,__webpack_require__);r.l=true;return r.exports}__webpack_require__.ab=__dirname+"/";function startup(){return __webpack_require__(340)}return startup()}({225:function(e){e.exports=require("next/dist/compiled/schema-utils")},340:function(e,t,i){"use strict";const r=i(712);e.exports=r.default;e.exports.raw=r.raw},622:function(e){e.exports=require("path")},710:function(e){e.exports=require("loader-utils")},712:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:true});t.default=loader;t.raw=void 0;var r=_interopRequireDefault(i(622));var o=_interopRequireDefault(i(710));var a=_interopRequireDefault(i(225));var n=_interopRequireDefault(i(813));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function loader(e){const t=o.default.getOptions(this);(0,a.default)(n.default,t,{name:"File Loader",baseDataPath:"options"});const i=t.context||this.rootContext;const s=o.default.interpolateName(this,t.name||"[contenthash].[ext]",{context:i,content:e,regExp:t.regExp});let u=s;if(t.outputPath){if(typeof t.outputPath==="function"){u=t.outputPath(s,this.resourcePath,i)}else{u=r.default.posix.join(t.outputPath,s)}}let p=`__webpack_public_path__ + ${JSON.stringify(u)}`;if(t.publicPath){if(typeof t.publicPath==="function"){p=t.publicPath(s,this.resourcePath,i)}else{p=`${t.publicPath.endsWith("/")?t.publicPath:`${t.publicPath}/`}${s}`}p=JSON.stringify(p)}if(t.postTransformPublicPath){p=t.postTransformPublicPath(p)}if(typeof t.emitFile==="undefined"||t.emitFile){this.emitFile(u,e)}const c=typeof t.esModule!=="undefined"?t.esModule:true;return`${c?"export default":"module.exports ="} ${p};`}const s=true;t.raw=s},813:function(e){e.exports={additionalProperties:true,properties:{name:{description:"The filename template for the target file(s) (https://github.com/webpack-contrib/file-loader#name).",anyOf:[{type:"string"},{instanceof:"Function"}]},outputPath:{description:"A filesystem path where the target file(s) will be placed (https://github.com/webpack-contrib/file-loader#outputpath).",anyOf:[{type:"string"},{instanceof:"Function"}]},publicPath:{description:"A custom public path for the target file(s) (https://github.com/webpack-contrib/file-loader#publicpath).",anyOf:[{type:"string"},{instanceof:"Function"}]},postTransformPublicPath:{description:"A custom transformation function for post-processing the publicPath (https://github.com/webpack-contrib/file-loader#posttransformpublicpath).",instanceof:"Function"},context:{description:"A custom file context (https://github.com/webpack-contrib/file-loader#context).",type:"string"},emitFile:{description:"Enables/Disables emit files (https://github.com/webpack-contrib/file-loader#emitfile).",type:"boolean"},regExp:{description:"A Regular Expression to one or many parts of the target file path. The capture groups can be reused in the name property using [N] placeholder (https://github.com/webpack-contrib/file-loader#regexp).",anyOf:[{type:"string"},{instanceof:"RegExp"}]},esModule:{description:"By default, file-loader generates JS modules that use the ES modules syntax.",type:"boolean"}},type:"object"}}});