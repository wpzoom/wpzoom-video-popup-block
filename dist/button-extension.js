(()=>{"use strict";const o=window.wp.element,e=window.wp.i18n,t=window.wp.hooks,r=window.wp.compose,n=window.wp.blockEditor,l=(0,r.createHigherOrderComponent)((t=>r=>{if("core/button"!==r.name)return(0,o.createElement)(t,r);const{attributes:l,setAttributes:c}=r,{customHoverBackgroundColor:a,customHoverTextColor:s}=l;return(0,o.createElement)(o.Fragment,null,(0,o.createElement)(t,r),(0,o.createElement)(n.InspectorControls,null,(0,o.createElement)(n.PanelColorSettings,{title:(0,e.__)("Hover Colors","wpzoom-video-popup-block"),initialOpen:!1,colorSettings:[{value:a,onChange:o=>{c({customHoverBackgroundColor:o})},label:(0,e.__)("Background Color","wpzoom-video-popup-block")},{value:s,onChange:o=>{c({customHoverTextColor:o})},label:(0,e.__)("Text Color","wpzoom-video-popup-block")}]})))}),"withHoverColorControls"),c=(0,r.createHigherOrderComponent)((e=>t=>{if("core/button"!==t.name)return(0,o.createElement)(e,t);const{attributes:r}=t,{customHoverBackgroundColor:n,customHoverTextColor:l}=r,c=`wpzoom-button-${t.clientId}`;let a="";return(n||l)&&(a=`\n                <style>\n                    #${c} .wp-block-button__link:hover {\n                        ${n?`background-color: ${n} !important;`:""}\n                        ${l?`color: ${l} !important;`:""}\n                    }\n                </style>\n            `),(0,o.createElement)("div",{id:c},(0,o.createElement)(e,t),a&&(0,o.createElement)("div",{dangerouslySetInnerHTML:{__html:a}}))}),"addHoverStyles");(0,t.addFilter)("blocks.registerBlockType","wpzoom/button-hover-colors/add-attributes",(function(o,e){if("core/button"!==e)return o;const t={...o.attributes,customHoverBackgroundColor:{type:"string"},customHoverTextColor:{type:"string"}};return{...o,attributes:t}})),(0,t.addFilter)("editor.BlockEdit","wpzoom/button-hover-colors/add-controls",l),(0,t.addFilter)("editor.BlockListBlock","wpzoom/button-hover-colors/add-styles",c),(0,t.addFilter)("blocks.getSaveContent.extraProps","wpzoom/button-hover-colors/add-attributes-to-save",(function(o,e,t){if("core/button"!==e.name)return o;const{customHoverBackgroundColor:r,customHoverTextColor:n}=t;return(r||n)&&(r&&(o["data-hover-background"]=r),n&&(o["data-hover-text"]=n),o.className=o.className?`${o.className} has-hover-colors`:"has-hover-colors"),o}))})();
//# sourceMappingURL=button-extension.js.map