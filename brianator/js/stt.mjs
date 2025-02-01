const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

class SpeechToText {
    constructor() {
        const rec =  new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        this._recognizer = rec;
    }
}

export { SpeechToText };