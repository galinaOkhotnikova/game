export default class SpriteManager{
    constructor() {
        //*Рисунок с объектами
        this.image = new Image();
        //*Массив объектов для отображения
        this.sprites = [];
        this.imgLoaded = false;
        this.jsonLoaded = false;
    }

    setManagers(mapManager){
        this.mapManager = mapManager;
    }
    //*Загрузка атласа изображения, принимает путь к файлу и путь к изображению
    loadAtlas(atlasJson, atlasImg){
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200){
                this.parseAtlas(request.responseText);
            }
        }
        request.open("GET",atlasJson,true);
        request.send();
        this.loadImg(atlasImg);
    }

    loadImg(imgName){
        this.image.onload = ()=>{
            this.imgLoaded = true;
        }
        this.image.src = imgName;
    }

    parseAtlas(atlasJson){
        let atlas = JSON.parse(atlasJson);
        for (let name in atlas.frames){
            //*сохраняется объект спрайт из загруженного атласа.
            let frame = atlas.frames[name].frame;
            this.sprites.push({
                name: name,
                x: frame.x,
                y: frame.y,
                w: frame.w,
                h: frame.h
            });
        }
        this.jsonLoaded = true;
    }
    //*Получаем спрайт по имени
    getSprite(name){
        for (let i = 0; i < this.sprites.length; i++){
            let s = this.sprites[i];
            if (s.name === name)
                return s;
        }
        return null;
    }

    drawSprite(ctx, name, x, y) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => {
                this.drawSprite(ctx, name, x, y);
            }, 100);
        } else {
            let sprite = this.getSprite(name);
            if (!this.mapManager.isVisible(x, y, sprite.w, sprite.h))
                return; 
            x -= this.mapManager.view.x;
            y -= this.mapManager.view.y;
            ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
        }
    }
}