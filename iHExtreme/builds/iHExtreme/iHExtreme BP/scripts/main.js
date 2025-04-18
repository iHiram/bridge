import { world, Dimension } from '@minecraft/server';
import { system } from '@minecraft/server';

const ENTITY_TYPES = {
    zombieVillager: 'minecraft:zombie_villager_v2',
    spider: 'minecraft:spider',
    caveSpider: 'minecraft:cave_spider',
    enderman: 'minecraft:enderman',
    piglin: 'minecraft:piglin',
    zombifiedPiglin: 'minecraft:zombiepig',
    blaze: 'minecraft:blaze',
    creeper: 'minecraft:creeper',
    evoker: 'minecraft:evoker',
    phantom: 'minecraft:phantom',
    skeleton: 'minecraft:skeleton',
    slime: 'minecraft:slime',
    vex: 'minecraft:vex',
    vindicator: 'minecraft:vindicator',
    witch: 'minecraft:witch',
    witherSkeleton: 'minecraft:wither_skeleton',
    zoglin: 'minecraft:zoglin',
    zombie: 'minecraft:zombie',
    stray: 'minecraft:stray',
    drowned: 'minecraft:drowned',
    pillager: 'minecraft:pillager',
    endermite: 'minecraft:endermite',
    piglinBrute: 'minecraft:piglin_brute',
    wither: 'minecraft:wither',
    shulker: 'minecraft:shulker',
    ghast: 'minecraft:ghast',
    enderDragon: 'minecraft:ender_dragon',
    warden: 'minecraft:warden',
    hoglin: 'minecraft:hoglin',
    ravager: 'minecraft:ravager',
    husk: 'minecraft:husk',
    magmaCube: 'minecraft:magma_cube',
    breeze: 'breeze',
    bogged: 'bogged',
    ironGolem: 'minecraft:iron_golem',
    player: 'minecraft:player',
    drownedType: 'minecraft:drowned',
    thrownTrident: 'minecraft:thrown_trident',
    lightningBolt: 'minecraft:lightning_bolt',
    fireball: 'minecraft:fireball'
};

const TAGS = {
    hasEffect: 'hasEffect',
    wither: 'ef-wither',
    nightVision: 'ef-nightvision',
    darkness: 'ef-darkness',
    levitation: 'ef-levitation',
    weakness: 'ef-weakness',
    slowness: 'ef-slowness',
    nausea: 'ef-nausea',
    blindness: 'ef-blindness',
    hunger: 'ef-hunger',
    poison: 'ef-poison',
    web: 'ef-web',
    breathing: 'ef-breathing',
    bornEffect: 'bornEffect',
    explosion: 'ef-explosion',
    attract: 'ef-attract',
    knockback: 'ef-knockback',
    fireball: 'ef-fireball',
    miningFatigue: 'ef-miningfatigue',
    lightningBolt: 'ef-lightningBolt',
    checkLightningBolt: 'checklightningBolt'
};

const PROBABILITIES = {
    infinity: 10000000,
    tProb: 1000,
    mobsRegular: 0.6,
    mobsSpider: 0.6,
    mobsRare: 0.4,
    mobsExceptions: 0.3,
    soCommun: 0.7,
    commun: 0.6,
    rare: 0.4,
    soRare: 0.25,
    legent: 0.15,
    soLegent: 0.03
};

const EXPLOSION_OPTIONS = { allowUnderwater: true, breaksBlocks: false, causesFire: true };

const neutralEntities = [
    ENTITY_TYPES.enderman,
    'minecraft:wolf',
    'minecraft:bee',
    ENTITY_TYPES.zombifiedPiglin,
    'minecraft:polar_bear',
    'minecraft:llama'
];

const listMobs = Object.values(ENTITY_TYPES).filter(type => type !== ENTITY_TYPES.ironGolem && type !== ENTITY_TYPES.player && type !== ENTITY_TYPES.drownedType && type !== ENTITY_TYPES.thrownTrident && type !== ENTITY_TYPES.lightningBolt && type !== ENTITY_TYPES.fireball);

const listMobsRegular = [ENTITY_TYPES.husk, ...neutralEntities, ENTITY_TYPES.bogged, ENTITY_TYPES.zombieVillager, ENTITY_TYPES.breeze, ENTITY_TYPES.evoker, ENTITY_TYPES.vex, ENTITY_TYPES.phantom, ENTITY_TYPES.vindicator, ENTITY_TYPES.witch, ENTITY_TYPES.witherSkeleton, ENTITY_TYPES.skeleton, ENTITY_TYPES.vindicator, ENTITY_TYPES.witch, ENTITY_TYPES.zombie, ENTITY_TYPES.stray, ENTITY_TYPES.drowned, ENTITY_TYPES.endermite, ENTITY_TYPES.zoglin, ENTITY_TYPES.pillager, ENTITY_TYPES.ravager];

const listMobsSpider = [ENTITY_TYPES.spider, ENTITY_TYPES.caveSpider];
const listMobsRare = [ENTITY_TYPES.magmaCube, ENTITY_TYPES.piglin, ENTITY_TYPES.zombifiedPiglin, ENTITY_TYPES.blaze, ENTITY_TYPES.slime, ENTITY_TYPES.piglinBrute, ENTITY_TYPES.wither, ENTITY_TYPES.shulker, ENTITY_TYPES.ghast, ENTITY_TYPES.enderDragon];
const listMobsExceptions = [ENTITY_TYPES.creeper, ENTITY_TYPES.warden, ENTITY_TYPES.hoglin];

let irand = random(1, PROBABILITIES.tProb);
let bSpawn = false;

console.warn('Version 1.1.23');

world.afterEvents.entityDie.subscribe(data => {
    const { deadEntity } = data;
    if (deadEntity.hasTag(TAGS.breathing)) {
        const targetPlayers = world.getPlayers({ tags: [deadEntity.name] });
        targetPlayers?.forEach(player => {
            player.addEffect('water_breathing', 40, 1);
            player.removeTag(deadEntity.name);
        });
    }
});

world.afterEvents.entitySpawn.subscribe(evnt => {
    const entity = evnt.entity;
    irand = random(1, PROBABILITIES.tProb);
    if (listMobs.includes(entity.typeId) && entity.nameTag === '' && !entity.hasTag(TAGS.hasEffect)) {
        if (irand <= PROBABILITIES.commun * PROBABILITIES.tProb && !bSpawn && entity.typeId !== ENTITY_TYPES.zombieVillager) {
            const dimension = world.getDimension(entity.dimension.id);
            dimension?.spawnEntity(entity.typeId, entity.location);
            bSpawn = true;
        } else {
            bSpawn = false;
        }
        if ([ENTITY_TYPES.spider, ENTITY_TYPES.creeper, ENTITY_TYPES.zombie].includes(entity.typeId)) {
            changeMob(entity);
        }
        if (irand <= PROBABILITIES.commun * PROBABILITIES.tProb) {
            addEffects(entity);
        }
        entity.addTag(TAGS.hasEffect);
    }
});

world.afterEvents.projectileHitEntity.subscribe(data => {
    const { projectile, source } = data;
    const entityHit = data.getEntityHit()?.entity;
    if (entityHit) {
        if (source.typeId === ENTITY_TYPES.drownedType && projectile.typeId === ENTITY_TYPES.thrownTrident && !source.hasTag(TAGS.lightningBolt) && !source.hasTag(TAGS.checkLightningBolt)) {
            irand = random(1, PROBABILITIES.tProb);
            if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
                source.addTag(TAGS.lightningBolt);
            }
            source.addTag(TAGS.checkLightningBolt);
        }
        runEffect(entityHit, source);
        if (source.hasTag(TAGS.attract)) {
            irand = random(1, PROBABILITIES.tProb);
            if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
                const disX = source.location.x - entityHit.location.x;
                const disZ = source.location.z - entityHit.location.z;
                entityHit.applyKnockback(disX / 1.5, disZ / 1.5, random(1, 10), 0);
            }
        }
        if (source.hasTag(TAGS.knockback)) {
            irand = random(1, PROBABILITIES.tProb);
            if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
                entityHit.applyKnockback(0, 0, 0, random(1, 2));
            }
        }
        if (source.hasTag(TAGS.fireball)) {
            if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
                spawnFireball(source.location, entityHit.location);
            }
        }
    }
});

world.afterEvents.entityHurt.subscribe(data => {
    const { damageSource, hurtEntity } = data;
    const hitEntity = hurtEntity;
    const entity = damageSource?.damagingEntity;
    if (hitEntity && entity) {
        if (listMobs.includes(entity.typeId)) {
            runEffect(hitEntity, entity);
            if (entity.hasTag(TAGS.knockback)) {
                irand = random(1, PROBABILITIES.tProb);
                if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
                    hitEntity.applyKnockback(0, 0, 0, random(1, 2));
                }
            }
            if (neutralEntities.includes(entity.typeId) || (entity.typeId === ENTITY_TYPES.ironGolem && hitEntity.typeId === ENTITY_TYPES.player)) {
                addEffects(entity);
                entity.addEffect('regeneration', 60, { amplifier: 3, showParticles: true });
            }
        }
    }
});

function addEffects(entity) {
    irand = random(1, PROBABILITIES.tProb);
    let contEffect = 0;

    const effectTags = [
        { effect: 'speed', amplifier: [1, 2], prob: PROBABILITIES.soCommun },
        { effect: 'absorption', amplifier: [1, 2], prob: PROBABILITIES.soRare },
        { effect: 'strength', amplifier: [1, 2], prob: PROBABILITIES.commun },
        { effect: 'resistance', amplifier: [1, 2], prob: PROBABILITIES.soRare },
        { effect: 'regeneration', amplifier: [1, 4], prob: PROBABILITIES.legent },
        { effect: 'invisibility', amplifier: null, prob: PROBABILITIES.rare },
        { tag: TAGS.wither, prob: PROBABILITIES.legent },
        { tag: TAGS.nightVision, prob: PROBABILITIES.soCommun },
        { tag: TAGS.darkness, prob: PROBABILITIES.rare },
        { tag: TAGS.levitation, prob: PROBABILITIES.soLegent },
        { tag: TAGS.weakness, prob: PROBABILITIES.soRare },
        { tag: TAGS.slowness, prob: PROBABILITIES.soRare },
        { tag: TAGS.nausea, prob: PROBABILITIES.soRare },
        { tag: TAGS.blindness, prob: PROBABILITIES.soRare },
        { tag: TAGS.hunger, prob: PROBABILITIES.soRare },
        { tag: TAGS.poison, prob: PROBABILITIES.legent },
        { tag: TAGS.web, prob: PROBABILITIES.legent },
        { tag: TAGS.fireball, prob: PROBABILITIES.legent },
        { tag: TAGS.lightningBolt, prob: PROBABILITIES.soLegent, condition: !entity.hasTag(TAGS.bornEffect) },
        { tag: TAGS.explosion, prob: PROBABILITIES.soLegent, condition: !entity.hasTag(TAGS.bornEffect) },
        { tag: TAGS.knockback, prob: PROBABILITIES.commun },
        { tag: TAGS.attract, prob: PROBABILITIES.commun }
    ];

    effectTags.forEach(({ effect, amplifier, prob, tag, condition }) => {
        if (condition === undefined || condition) {
            irand = random(1, PROBABILITIES.tProb);
            if (irand <= prob * PROBABILITIES.tProb) {
                if (effect) {
                    entity.addEffect(effect, PROBABILITIES.infinity, { amplifier: random(...amplifier), showParticles: true });
                    contEffect++;
                } else if (tag) {
                    entity.addTag(tag);
                    contEffect++;
                }
            }
        }
    });

    // Determina la dificultad basada en la cantidad de efectos
    const difficultyTag = getDifficultyTag(contEffect);
    setNameTag(entity, difficultyTag);
}

function getDifficultyTag(effectCount) {
    if (effectCount <= 6) {
        return "§aEasy Mob"; // Verde para fácil
    } else if (effectCount <= 12) {
        return "§eModerate Mob"; // Amarillo para moderado
    } else if (effectCount <= 20) {
        return "§cHard Mob"; // Rojo para difícil
    } else {
        return "§6Boss Mob"; // Naranja para boss
    }
}

function setNameTag(entity, name) {
    const nameTagComponent = entity.getComponent("minecraft:nameable");
    if (nameTagComponent) {
        nameTagComponent.nameTag = name;
        nameTagComponent.alwaysShow = true;
    }
}

function spawnFireball(position, direction) {
    const fireball = world.spawnEntity(ENTITY_TYPES.fireball, position);
    fireball?.setVelocity(direction);
}

function runEffect(entityHit, sourceEntity) {
    const dimension = entityHit.dimension;
    const effectActions = [
        { tag: TAGS.wither, effect: 'wither', duration: [50, 200], amplifier: 1 },
        { tag: TAGS.nightVision, effect: 'night_vision', duration: [50, 200], amplifier: 20 },
        { tag: TAGS.darkness, effect: 'darkness', duration: [50, 200], amplifier: 2 },
        { tag: TAGS.levitation, effect: 'levitation', duration: [50, 200], amplifier: 1 },
        { tag: TAGS.weakness, effect: 'weakness', duration: [50, 200], amplifier: random(1, 2), showParticles: true },
        { tag: TAGS.slowness, effect: 'slowness', duration: [50, 200], amplifier: random(1, 2), showParticles: true },
        { tag: TAGS.nausea, effect: 'nausea', duration: [50, 200], amplifier: 1 },
        { tag: TAGS.blindness, effect: 'blindness', duration: [50, 300], amplifier: 1 },
        { tag: TAGS.hunger, effect: 'hunger', duration: [50, 200], amplifier: random(1, 3), showParticles: true },
        { tag: TAGS.poison, effect: 'poison', duration: [50, 200], amplifier: 1 },
        { tag: TAGS.breathing, effect: 'water_breathing', duration: PROBABILITIES.infinity, amplifier: 1 },
        { tag: TAGS.miningFatigue, effect: 'mining_fatigue', duration: [50, 200], amplifier: 1 }
    ];

    effectActions.forEach(({ tag, effect, duration, amplifier, showParticles }) => {
        if (sourceEntity.hasTag(tag)) {
            entityHit.addEffect(effect, random(...duration), { amplifier, showParticles });
        }
    });

    if (sourceEntity.hasTag(TAGS.web) && random(1, PROBABILITIES.tProb) <= PROBABILITIES.soRare * PROBABILITIES.tProb) {
        dimension.fillBlocks(entityHit.location, entityHit.location, 'web');
    }

    if (sourceEntity.hasTag(TAGS.lightningBolt)) {
        irand = random(1, PROBABILITIES.tProb);
        if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
            sourceEntity.addEffect('resistance', 10, 2);
            sourceEntity.addEffect('absorption', 10, 2);
            dimension.spawnEntity(ENTITY_TYPES.lightningBolt, entityHit.location);
            if (random(1, PROBABILITIES.tProb) <= PROBABILITIES.rare * PROBABILITIES.tProb) {
                entityHit.addEffect('resistance', 5, 1);
                entityHit.addEffect('blindness', random(30, 50), 1);
                spawnEntities(dimension, entityHit.location, ENTITY_TYPES.endermite, 3);
            }
        }
    }

    if (sourceEntity.hasTag(TAGS.explosion)) {
        irand = random(1, PROBABILITIES.tProb);
        if (irand <= PROBABILITIES.soCommun * PROBABILITIES.tProb) {
            sourceEntity.addEffect('resistance', 10, 2);
            sourceEntity.addEffect('absorption', 10, 2);
            dimension.createExplosion(entityHit.location, 1, EXPLOSION_OPTIONS);
            if (random(1, PROBABILITIES.tProb) <= PROBABILITIES.rare * PROBABILITIES.tProb) {
                entityHit.addEffect('resistance', 5, 1);
                entityHit.addEffect('blindness', random(30, 50), 1);
                spawnEntities(dimension, entityHit.location, ENTITY_TYPES.endermite, 3);
            }
        }
    }
}

function spawnEntities(dimension, location, entityType, count) {
    for (let i = 0; i < count; i++) {
        const entity = dimension.spawnEntity(entityType, location);
        entity.addTag(TAGS.bornEffect);
        entity.addEffect('speed', PROBABILITIES.infinity, 1);
    }
}

function changeMob(entity) {
    if (entity.typeId === ENTITY_TYPES.spider) {
        irand = random(1, PROBABILITIES.tProb);
        if (irand <= PROBABILITIES.commun * PROBABILITIES.tProb) {
            entity.kill();
            entity.runCommandAsync('kill @e[type=item,r=1]');
            entity.runCommandAsync(`summon cave_spider ${Math.floor(entity.location.x)} ${Math.floor(entity.location.y)} ${Math.floor(entity.location.z)}`);
        }
    } else if (entity.typeId === ENTITY_TYPES.creeper) {
        irand = random(1, PROBABILITIES.tProb);
        if (irand <= PROBABILITIES.rare * PROBABILITIES.tProb) {
            entity.kill();
            entity.runCommandAsync('kill @e[type=item,r=1]');
            entity.runCommandAsync(`summon minecraft:creeper ${Math.floor(entity.location.x)} ${Math.floor(entity.location.y)} ${Math.floor(entity.location.z)} ~ ~ minecraft:become_charged`);
        }
    } else if (entity.typeId === ENTITY_TYPES.zombie) {
        irand = random(1, PROBABILITIES.tProb);
        if (irand <= PROBABILITIES.commun * PROBABILITIES.tProb) {
            entity.kill();
            entity.runCommandAsync('kill @e[type=item,r=1]');
            entity.runCommandAsync(`summon husk ${Math.floor(entity.location.x)} ${Math.floor(entity.location.y)} ${Math.floor(entity.location.z)}`);
        }
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
