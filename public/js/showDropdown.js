const button = document.querySelector('#dropdownSearchButton');
button.addEventListener('click', () => {
    const dropDown = document.querySelector('#dropdownSearch');
    if(dropDown.classList.contains('hidden')) {
        dropDown.classList.remove('hidden')
    } else {
        dropDown.classList.add('hidden')
    }
})