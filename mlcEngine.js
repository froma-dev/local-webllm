import {CreateWebWorkerMLCEngine, CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
const INIT_PROGRESS = 0
const INIT_PROGRESS_FINISHED = 1

export class MlcEngine {
    constructor() {}

    initProgressCallback(info) {
        if(info.progress === INIT_PROGRESS) {
            document.dispatchEvent(new CustomEvent("initprogress", {
                detail: {
                    progress: INIT_PROGRESS,
                    info
                },
            }))
        } else if(info.progress === INIT_PROGRESS_FINISHED) {
            document.dispatchEvent(new CustomEvent("initprogressfinished", {
                detail: {
                    progress: INIT_PROGRESS_FINISHED,
                    info
                },
            }))
        }
    }

    async loadEngine() {
        const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC-1k'
        const workerPath = new URL("./worker.js", import.meta.url)
        const workerOptions = {type: "module"}

        this.messages = []

        if (window.Worker) {
            this.engine = await CreateWebWorkerMLCEngine(
                new Worker(workerPath, workerOptions),
                SELECTED_MODEL,
                {initProgressCallback: this.initProgressCallback}
            )
        } else {
            this.engine = await CreateMLCEngine(
                SELECTED_MODEL,
                {initProgressCallback: this.initProgressCallback}
            )
        }
    }

    async startChat({promptMessage}) {
        let chunks
        let messages = this.messages

        messages.push(promptMessage)

        try {
            chunks = await this.engine.chat.completions.create({
                messages,
                temperature: 1,
                stream: true,
                stream_options: { include_usage: true },
            })
        } catch(err) {
            throw new Error(err)
        }

        return chunks
    }

    async appendChunks({chunks, $messageText, message, onChunkContent}) {
        for await (const chunk of chunks) {
            const [choice] = chunk.choices
            const content = choice?.delta.content ?? ""

            onChunkContent({content, $messageText})
        }

        message.content = await this.getMessage()
        this.messages.push(message)
    }

    clearContext() {
        this.messages.length = 0
    }

    async getMessage() {
        return this.engine.getMessage()
    }
}