export default class SoundManager{
    constructor() {
        this.clips = {};
        this.context = null;
        this.gainNode = null;
        this.loaded = false;
        this.init();
    }

    init(){
        this.context = new AudioContext();
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination);
    }

    // initManagers(gameManager, mapManager){
    //     this.gameManager = gameManager;
    //     this.mapManager = mapManager;
    // }

    load(path,callback){
        if (this.clips[path]){
            callback(this.clips[path]);
            return;
        }
        let clip = {path: path, buffer : null, loaded: false};
        clip.play = (volume,loop) => {
            this.play(path, {looping: loop ? loop : false, volume: volume ? volume : 1});
        }
        this.clips[path] = clip;
        let request = new XMLHttpRequest();
        request.open('GET',path,true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            this.context.decodeAudioData(request.response,(buffer)=>{
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        }
        request.send();
    }

    loadArray(array){
        for (let i=0; i<array.length; i++){
            this.load(array[i],()=>{
                if (array.length === Object.keys(this.clips).length){
                    for (let sd in this.clips){
                        if (!this.clips[sd].loaded) return;
                    }
                    this.loaded = true;
                }
            });
        }
    }

    play(path,settings){
        if (!this.loaded){
            setTimeout(()=>{
                this.play(path,settings);
            },1000);
            return;
        }
        let looping = false;
        let volume = 1;
        if (settings){
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume)
                volume = settings.volume;
        }
        let sd = this.clips[path];
        if (sd === null)
            return false;
        console.log(this.clips);
        console.log("SD: ", sd);
        let sound = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = looping;
        this.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }

    /*playWorldSound(path,x,y){
        if (this.gameManager.player === null)
            return;

        let viewSize = Math.max(this.mapManager.view.w, this.mapManager.view.h)*0.8;
        let dx = Math.abs(this.gameManager.player.pos_x-x);
        let dy = Math.abs(this.gameManager.player.pos_y-y);
        let distance = Math.sqrt(dx*dx+dy*dy);
        let norm = distance/viewSize;
        if (norm>1)
            norm = 1;
        let volume = 1.0-norm;
        if (!volume)
            return;
        this.play(path,{looping:false,volume:volume});
    }*/

}