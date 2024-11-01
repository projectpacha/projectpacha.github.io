const themeToggle=document.querySelector(".theme-toggle"),menuIcon=document.querySelector(".menu-icon"),mobileMenu=document.querySelector(".mobile-menu"),body=document.body,searchInput=document.getElementById("searchInput"),manglishToggle=document.getElementById("manglish-toggle");async function countEntries(){try{var e=await(await fetch("data.xml")).text(),t=(new DOMParser).parseFromString(e,"application/xml").getElementsByTagName("entry");document.getElementById("entry-count").textContent="നിലവിലെ വാക്കുകളുടെ എണ്ണം: "+t.length}catch(e){console.error("Error counting entries:",e)}}function updateThemeIcon(e){themeToggle.textContent="dark-mode"===e?"dark_mode":"light_mode"}document.addEventListener("DOMContentLoaded",countEntries),document.addEventListener("DOMContentLoaded",()=>{var e=localStorage.getItem("theme");e&&(body.classList.add(e),updateThemeIcon(e))}),themeToggle.addEventListener("click",()=>{var e="dark-mode"==(body.classList.contains("dark-mode")?"dark-mode":"light-mode")?"light-mode":"dark-mode";body.classList.toggle("dark-mode"),localStorage.setItem("theme",e),updateThemeIcon(e)}),menuIcon.addEventListener("click",()=>{mobileMenu.classList.toggle("visible"),body.classList.toggle("menu-open",mobileMenu.classList.contains("visible"))});
