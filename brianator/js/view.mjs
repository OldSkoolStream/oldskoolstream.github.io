import { SpeechToText } from "./stt.mjs";

class BrianatorView {
    constructor(opts) {
        this._audioElement = opts?.audio;
        this._audioSrcElement = opts?.audioSrc;
        this._control = opts?.control;
        this._log = opts?.log;
        this._logContainer = opts?.logContainer;
        this._playingLineId = null;
        this._recordingId = null;
        this._stt = new SpeechToText();
        this._recordings = [];
        this._outputQueue = [];
    }

    initialize() {
        this._audioElement.addEventListener('ended', () => {
            const line = document.getElementById(this._playingLineId);
            line.classList.remove('playing');
            this._playingLineId = null;
            this._playNextLine();
        });

        this._control.addEventListener('click', () => { 
            if (this._recordingId) {
                this._stt.stop();
            } else {
                this._recordingId = `recording-${this._getNewRecordingId()}`;
                const div = document.createElement('DIV');
                div.id = this._recordingId;
                div.classList.add('recording', 'live');
                this._recordings.push(div);
                this._log.appendChild(div);
                this._control.classList.add("live");
                this._stt.start();
                this._logContainer.scrollTo({top: 0, behavior: 'smooth'});
            }
        });

        this._stt.onFinalResult = (resultNumber, text) => {
            const line = this._getOrMakeLine(this._recordingId, resultNumber);
            if (!line) return;
            line.innerText = text;
            line.classList.add('final');
            console.debug(`final result: ${text}`);
            this._queueLine(line.id);
        };

        this._stt.onInterimResult = (resultNumber, text) => {
            const line = this._getOrMakeLine(this._recordingId, resultNumber);
            if (!line) return;
            line.innerText = text;
            console.debug(`interim result: ${text}`);
        };

        this._stt.onEnd = () => {
            const recording = this._recordings.find(l => l.id == this._recordingId);
            recording?.classList.remove('live');
            this._recordingId = null;
            this._control.classList.remove("live");
        };
    }

    _getNewRecordingId() {
        return crypto.randomUUID();
    }

    _getOrMakeLine(recordingId, resultIndex) {
        const recording = this._recordings.find(r => r.id == recordingId);
        if (!recording) return null;
        const lineId = `${recordingId}-${resultIndex}`;
        let line = document.querySelector(`#${lineId}`);
        if (!line) {
            line = document.createElement('div');
            line.id = lineId;
            line.classList.add('recording-line');
            recording.appendChild(line);
        }
        return line;
    }

    _queueLine(lineId) {
        this._outputQueue.push(lineId);
        this._playNextLine();
    }

    _unqueueLine(id) {
        this._outputQueue = this._outputQueue.filter(i => i != id);
    }

    _playNextLine() {
        if (this._playingLineId || this._outputQueue.length == 0) return;
        this.speakLine(this._outputQueue.shift());
    }

    async speakLine(id, asVoice) {
        if (!id) return;
        this._playingLineId = id;
        if (!asVoice) { asVoice = 'Brian'; }

        const line = document.getElementById(id);
        line.classList.add('playing');
        const text = line.innerText?.trim();
        if (!text) return this._playNextLine();
    
        const speak = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${asVoice}&text=${encodeURIComponent(text)}`);
    
        if (speak.status != 200) {
            return this._playNextLine();
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