document.addEventListener("DOMContentLoaded",(function(){const t=document.querySelectorAll(".wp-block-button__link.has-hover-colors"),e=document.createElement("style");document.head.appendChild(e);let o="";t.forEach(((t,e)=>{const n=t.getAttribute("data-hover-background"),r=t.getAttribute("data-hover-text");if(n||r){const a=`wpzoom-button-frontend-${e}`;t.id=a,o+=`\n                #${a}:hover {\n                    ${n?`background-color: ${n} !important;`:""}\n                    ${r?`color: ${r} !important;`:""}\n                    transition: all 0.3s ease !important;\n                }\n            `}})),e.textContent=o,t.forEach((t=>{const e=t.getAttribute("data-hover-background"),o=t.getAttribute("data-hover-text");if(e||o){const n=window.getComputedStyle(t),r=n.backgroundColor,a=n.color;t.style.transition="all 0.3s ease",t.addEventListener("mouseenter",(function(){e&&(this.style.backgroundColor=e),o&&(this.style.color=o)})),t.addEventListener("mouseleave",(function(){e&&(this.style.backgroundColor=r),o&&(this.style.color=a)}))}}))}));
//# sourceMappingURL=button-extension-frontend.js.map