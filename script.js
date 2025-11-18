let cross = document.querySelector('#cross');
let sidemenu = document.querySelector('.sidemenu');
let overlay = document.querySelector('.overlay');
let ham = document.querySelector("#hamburger");
ham.addEventListener('click',()=>{
        sidemenu.classList.add("sideanim");
        overlay.style.display="block"
})
 cross.addEventListener('click',()=>{
       overlay.style.display="none";
 })
