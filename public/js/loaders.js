import Level from './level.js';
import SpriteSheet from './spritesheet_class.js';
import { createSpriteLayer, createBackgroundLayer } from './layers.js';

export function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image;
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    });
}

function loadJson(url) {
    return fetch(url)
        .then(r => r.json())
}

function createTiles(level, backgrounds) {

    function applyRange(background, xStart, xLength, yStart, yLength) {
        const xEnd = xStart + xLength;
        const yEnd = yStart + yLength;
        for (let x = xStart; x < xEnd; x++) {
            for (let y = yStart; y < yEnd; y++) {
                level.tiles.set(x, y, {
                    name: background.tile,
                    type: background.type
                })
            }
        }
    }


    backgrounds.forEach(background => {
        background.ranges.forEach(range => {
            if (range.length === 4) {
                const [xStart, xLength, yStart, yLength] = range;
                applyRange(background, xStart, xLength, yStart, yLength);
            } else if (range.length === 3) {
                const [xStart, xLength, yStart] = range;
                applyRange(background, xStart, xLength, yStart, 1);
            } else if (range.length === 2) {
                const [xStart, yStart] = range;
                applyRange(background, xStart, 1, yStart, 1);
            }
        });
    });
}

export function loadSpriteSheet(name) {
    return loadJson(`/sprites/${name}.json`)
        .then(sheetSpec => Promise.all([
            sheetSpec,
            loadImage(sheetSpec.imageURL)
        ]))
        .then(([sheetSpec, image]) => {
            const sprites = new SpriteSheet(
                image,
                sheetSpec.tileW,
                sheetSpec.tileH
            );

            if (sheetSpec.tiles) {
                sheetSpec.tiles.forEach((tileSpec) => {
                    sprites.defineTile(
                        tileSpec.name,
                        tileSpec.index[0],
                        tileSpec.index[1]
                    );
                });
            }

            if (sheetSpec.frames) {
                sheetSpec.frames.forEach(frameSpec => {
                    sprites.define(frameSpec.name, ...frameSpec.rect);
                })
            }

            return sprites;
        });
}

export function loadLevel(name) {
    return loadJson(`/levels/${name}.json`)
        .then(levelSpec => Promise.all([
            levelSpec,
            loadSpriteSheet(levelSpec.spriteSheet),
        ]))
        .then(([levelSpec, backgroundSprites]) => {
            const level = new Level();

            createTiles(level, levelSpec.backgrounds);

            const backgroundLayer = createBackgroundLayer(level, backgroundSprites);
            level.comp.layers.push(backgroundLayer);

            const spriteLayer = createSpriteLayer(level.entities);
            level.comp.layers.push(spriteLayer);

            return level;
        });
}