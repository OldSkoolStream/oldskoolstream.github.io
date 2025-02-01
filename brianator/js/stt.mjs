
class SpeechToText {
    constructor() {
        const rec =  new webkitSpeechRecognition();
        this._recognizer = rec;
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (evt) => {
            return this._handleResult(evt);
        }
        rec.onspeechend = () => {
            console.debug('stt: speechend()');
            this.stop();
        }
    }

    start() {
        console.debug('stt: start()');
        this._recognizer.start();
    }

    stop() {
        this._recognizer.stop();
        this.onEnd();
    }

    _handleResult(evt) {
        const resultIndex = evt.results.length - 1;
        const result = evt.results[resultIndex];
        const text = result[0]?.transcript;
        if (result.isFinal) {
            return this.onFinalResult(resultIndex, text);
        } else {
            return this.onInterimResult(resultIndex, text);
        }
    }

    onEnd() {
        return false; // Overridden by consumer
    }

    onFinalResult(result) {
        return false; // Overridden by consumer
    }

    onInterimResult(result) {
        return false; // Overridden by consumer
    }
}



export { SpeechToText };