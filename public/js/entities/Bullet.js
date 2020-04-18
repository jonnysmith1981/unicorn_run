import Entity, { Sides, Trait } from '../Entity.js';
import Killable from '../traits/Killable.js';
import Physics from '../traits/Physics.js';
import { loadSpriteSheet } from '../loaders.js';
import Solid from '../traits/Solid.js';
import Velocity from '../traits/Velocity.js';
import Gravity from '../traits/Gravity.js';

export function loadBullet() {
    return loadSpriteSheet('bullet').then(createBulletFactory);
}

class Behaviour extends Trait {
    constructor() {
        super('behaviour');
        this.gravity = new Gravity();
    }

    collides(us, them) {
        if (us.killable.dead) {
            return;
        }

        if (them.stomper) {
            if (them.vel.y > us.vel.y) {
                us.killable.kill();
                us.vel.set(100, -200);
            } else {
                them.killable.kill();
            }
        }
    }

    update(entity, gameContext, level) {
        if (entity.killable.dead) {
            this.gravity.update(entity, gameContext, level);
        }
    }
}

function createBulletFactory(sprite) {
    function drawBullet(context) {
        sprite.draw('bullet', context, 0, 0, this.vel.x < 0);
    }

    return function createBullet() {
        const bullet = new Entity();
        bullet.size.set(16, 14);

        bullet.addTrait(new Velocity());
        bullet.addTrait(new Behaviour());
        bullet.addTrait(new Killable());

        bullet.draw = drawBullet;

        return bullet;
    };
}