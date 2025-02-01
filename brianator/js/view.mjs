import { SpeechToText } from "./stt.mjs";

class BrianatorView {
    constructor(opts) {
        this._audioElement = opts?.audio;
        this._audioSrcElement = opts?.audioSrc;
        this._control = opts?.control;
        this._log = opts?.log;
        this._playlingLineId = null;
        this._recordingLineId = null;
        this._stt = new SpeechToText();
        this._lines = [];
        this._outputQueue = [];
    }

    initialize() {
        this._audioElement.addEventListener('ended', () => {
            this._playNextLine();
        });

        this._control.addEventListener('click', () => { 
            if (this._recordingLineId) {
                this._stt.stop();
            } else {
                this._recordingLineId = this._getNewLineId();
                const div = document.createElement('DIV');
                div.id = `line-${this._recordingLineId}`;
                div.classList.add('recording');
                this._control.classList.add("recording");
                this._stt.start();
            }
        });

        this._stt.onFinalResult((result) => {
            this._queueLine(this._recordingLineId, result);
        });

        this._stt.onInterimResult((result) => {
            const line = this._lines.find(l => l.id == this._recordingLineId);
            line.text = result;

        });

        this._stt.onEnd(() => {
            const line = this._lines.find(l => l.id == this._recordingLineId);
            const div = document.getElementById(`line-${line?.id}`);
            div?.classList.remove('recording');
            this._recordingLineId = null;
            this._control.classList.remove("recording");
        });
    }

    _getNewLineId() {
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }
        const idValues = this._lines.map(l => l.id);
        return (Math.max(...idValues) ?? 0) + 1;
    }

    _queueLine(id) {
        this._outputQueue.push(id);
        this._playNextLine();
    }

    _unqueueLine(id) {
        this._outputQueue = this._outputQueue.filter(i => i != id);
    }

    _playNextLine() {
        if (this._playlingLineId) return;
        this.speakLine(this._outputQueue.shift());
    }

    async speakLine(id, asVoice) {
        if (!id) return;
        if (!asVoice) { asVoice = 'Brian'; }

        const text = (this._lines.find(l => l.id == id) ?? '').trim();
    
        const speak = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${asVoice}&text=${encodeURIComponent(text)}`);
    
        if (speak.status != 200) {
            return;
        }
    
        const snd = await speak.blob();
    
        const blobUrl = URL.createObjectURL(snd);
        const audio = this._audioElement;
        const source = this._audioSrcElement;
        source.setAttribute('src', blobUrl);
        audio.pause();
        audio.load();
        audio.play();
    }
}

export { BrianatorView }