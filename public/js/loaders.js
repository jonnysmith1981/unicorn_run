import SpriteSheet from './spritesheet.js';
import { createAnim } from './animations.js';

export function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    })
}

export function loadJSON(url) {
    return fetch(url).then(data => data.json())
}

export function loadSpriteSheet(name) {
    return loadJSON(`/sprites/${name}.json`).then(sheetSpec => Promise.all([
        sheetSpec,
        loadImage(sheetSpec.imageUrl)
    ])).then(([sheetSpec, image]) => {
        const sprites = new SpriteSheet(image, sheetSpec.tileW, sheetSpec.tileH);

        if (sheetSpec.tiles) {
            sheetSpec.tiles.forEach(tileSpec => {
                sprites.defineTile(tileSpec.name, tileSpec.index[0], tileSpec.index[1]);
            });
        }

        if (sheetSpec.frames) {
            sheetSpec.frames.forEach(frameSpec => {
                sprites.define(frameSpec.name, ...frameSpec.rect);
            });
        }

        if (sheetSpec.animations) {
            sheetSpec.animations.forEach(animSpec => {
                const animation = createAnim(animSpec.frames, animSpec.frameLen);
                sprites.defineAnim(animSpec.name, animation);
            });
        }

        return sprites;
    });
}