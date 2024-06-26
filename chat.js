import {MlcEngine} from "./mlcEngine.js";
import botAvatarSrc from '/logos/lightning.svg'
import userAvatarSrc from '/icons/user.svg'
import trashIcon from '/icons/trash.svg'

let $clearContextButton
let $loadingInfoText
let $messageTemplate
let $promptInput
let $submitPromptButton
let $main
let $chat
let $welcomeMessage
let mlcEngine

export function clearContext() {
    mlcEngine.clearContext()
    $chat.textContent = ''
    setWelcomeMessage()
}

export function addMessage({role, content}) {
    const clonedTemplate = $messageTemplate.content.cloneNode(true)
    const $newMessage = clonedTemplate.querySelector('.message')

    const $avatar = $newMessage.querySelector('.avatar')
    const $messageText = $newMessage.querySelector('p')
    const avatarSrc = role === 'user' ? userAvatarSrc : botAvatarSrc;

    $messageText.textContent = content
    $avatar.setAttribute('src', avatarSrc)
    $newMessage.classList.add(role)

    $chat.appendChild($newMessage)

    if (role === 'user') {
        $main.scrollTop = $main.scrollHeight
    }

    return $messageText
}

export async function setChat($parent) {
    $main = document.querySelector('main')
    $chat = document.createElement('ul')
    $chat.classList.add('chat')

    $main.appendChild($chat)
    setPrompter($parent)
    setMessageTemplate($parent)

    document.addEventListener('initprogress', onInitProgress)
    document.addEventListener('initprogressfinished', onInitProgressFinished)
    document.addEventListener('initprogressfinished', setWelcomeMessage, {once: true})

    mlcEngine = new MlcEngine()
    await mlcEngine.loadEngine()
}

const onInitProgress = (ev) => {
    const {text} = ev.detail
    $loadingInfoText.textContent = `${text}`
}

const onInitProgressFinished = async (ev) => {
    onInitProgress(ev)
    $submitPromptButton.removeAttribute('disabled')
    $loadingInfoText.classList.add('hide')
    $promptInput.focus()
}

const setWelcomeMessage = () => {
    addMessage({role: 'system', content: 'Hi! Please type your prompt below.'})
    $welcomeMessage = $chat.querySelector('.system')
}

function setPrompter($parent) {
    const $prompter = document.createElement('div')
    const $form = document.createElement('form')
    $clearContextButton = document.createElement('button')

    $loadingInfoText = document.createElement('small')
    $clearContextButton.setAttribute('disabled', '')
    $clearContextButton.classList.add('clean')
    $clearContextButton.innerHTML = `
        <img src=${trashIcon} alt="bin">
        <span class="clean-text">Clear context</span>`

    $form.setAttribute('action', '')
    $form.innerHTML = `
        <input class="prompt-input" placeholder="Type your prompt here">
        <button class="submit-prompt" disabled>Send</button>`

    $loadingInfoText.classList.add('loading-info')
    $loadingInfoText.innerHTML = `&nbsp;`

    $prompter.classList.add('prompter')
    $prompter.appendChild($clearContextButton)
    $prompter.appendChild($form)
    $prompter.appendChild($loadingInfoText)
    $promptInput = $prompter.querySelector('.prompt-input')
    $submitPromptButton = $prompter.querySelector('.submit-prompt')

    $parent.appendChild($prompter)

    $clearContextButton.addEventListener('click', (ev) => {
        clearContext()
        ev.currentTarget.setAttribute('disabled', '')
    })

    $form.addEventListener('submit', async (ev) => {
        ev.preventDefault()
        const promptInputText = $promptInput.value.trim()

        if (promptInputText !== '') {
            resetPromptInput()
        }

        if (!$welcomeMessage.classList.contains('hidden')) {
            $welcomeMessage.classList.add('hidden')
        }

        const promptMessage = addUserMessage({message: promptInputText})
        await submitPrompt({promptMessage})
    })
}

async function submitPrompt({promptMessage}) {
    $submitPromptButton.setAttribute('disabled', '')
    $clearContextButton.setAttribute('disabled', '')
    let chunks = await mlcEngine.startChat({promptMessage})

    const botMessage = {
        role: 'assistant',
        content: ''
    }

    const $messageText = addMessage(botMessage)

    await mlcEngine.appendChunks({
        chunks,
        onChunkContent: appendChunks,
        $messageText,
        message: botMessage
    })

    $submitPromptButton.removeAttribute('disabled')
    $clearContextButton.removeAttribute('disabled')
}

function addUserMessage({message}) {
    const userMessage = {
        role: 'user',
        content: message
    }
    addMessage(userMessage)

    return userMessage
}

function appendChunks({content, $messageText}) {
    const $spanText = document.createElement('span')

    $spanText.textContent = content
    $spanText.classList.add('show')
    $messageText.appendChild($spanText)
    $main.scrollTop = $main.scrollHeight
}

function resetPromptInput() {
    $promptInput.value = ''
}

function setMessageTemplate($parent) {
    $messageTemplate = document.createElement('template')

    $messageTemplate.setAttribute('id', 'message-template')
    $messageTemplate.innerHTML = `
    <li class="message">
        <img class="avatar" alt="avatar">
        <p></p>
    </li>`
    $parent.append($messageTemplate)
}