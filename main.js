import './style.css'
import {setChat, setMessageTemplate} from "./chat.js";
import {setLoader} from "./components/loader.js";

const $body = document.querySelector('body')

$body.innerHTML = `
<h1>WebLLM</h1>
<main id="app"></main>
`

setChat($body)
setLoader($body)
