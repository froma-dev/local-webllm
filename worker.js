import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm"

// A handler that resides in the worker thread
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msgEv) => {
    handler.onmessage(msgEv);
};