import brandLogo from '/logos/lightning.svg'

let $loader

export function setLoader($parent) {
    $loader = document.createElement('div')

    $loader.classList.add('loader')
    $loader.innerHTML = `
    <img src=${brandLogo} class="loader-image" alt="loader">
    <p class="loader-text">Loading...</p>`

    document.addEventListener('initprogressfinished', (e) => {
        hide()
    })

    $parent.appendChild($loader)
}

const hide = () => {
    $loader.classList.add('hidden')
}