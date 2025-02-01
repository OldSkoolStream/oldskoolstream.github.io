
class SpeechToText {
    constructor() {
        const SpeechRecognition = SpeechRecognition ?? webkitSpeechRecognition;
        const rec =  new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        this._recognizer = rec;
    }

    start() {

    }

    _handleResult(evt) {

    }

    onFinalResult(result) {
        return false; // Overridden by consumer
    }

    onInterimResult(result) {
        return false; // Overridden by consumer
    }
}



export { SpeechToText };