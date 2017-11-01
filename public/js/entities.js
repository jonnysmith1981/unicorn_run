import Entity from './entity.js';
import Jump from './traits/jump.js';
import Go from './traits/go.js';
import { loadSpriteSheet } from './loaders.js';
import { createAnimation } from './animation.js';

const FAST_DRAG = 1/5000;
const SLOW_DRAG = 1/1000;
export function createMario() {

    return loadSpriteSheet('mario').then(sprite => {
        const mario = new Entity();
        mario.size.set(14, 16);

        mario.addTrait(new Go());
        mario.addTrait(new Jump());
        mario.go.dragCoef = SLOW_DRAG;

        mario.turbo = function setTurboState(turboOn) {
            this.go.dragCoef = turboOn ? FAST_DRAG : SLOW_DRAG;
        }

        const runAnim = createAnimation(['run-1', 'run-2', 'run-3'], 6);

        function routeFrame(mario) {
            if (mario.jump.falling) {
                return 'jump';
            }
            if (mario.go.distance > 0) {
                if (mario.vel.x > 0 && mario.go.dir < 0 || mario.vel.x < 0 && mario.go.dir > 0) {
                    return 'brake';
                }
                return runAnim(mario.go.distance);
            }
            return 'idle';
        }

        mario.draw = function drawMario(context) {
            sprite.draw(routeFrame(this), context, 0, 0, this.go.heading < 0)
        }
        return mario;
    });
}