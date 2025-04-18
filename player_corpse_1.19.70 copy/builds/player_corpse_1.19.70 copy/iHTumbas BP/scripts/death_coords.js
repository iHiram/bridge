import { world, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

console.warn("corpse running v8");

const TextConstants = {
  dimensionNames: {
    overworld: "§aOverworld",
    nether: "§cNether",
    the_end: "§5End"
  },
  statusMessages: {
    playerDied: "status.playerDied",
    conservedXP: "Se ha conservado el % XP",
    mustDestroyTomb: "Es necesario eliminar la tumba para obtener su XP",
    eliminated: "Eliminada",
    eliminatedGuardians: "Guardianes exterminados.",
    notOwner: "Parece ser que no eres el propietario.",
    requires5Levels: "Necesitas al menos 5 niveles de xp"
  },
  buttonLabels: {
    eliminate: "Eliminar",
    keep: "Mantener",
    forceElimination: "Eliminacion forzada",
    noStoredCoords: "No tienes coordenadas almacenadas",
    teleport: "Teletransporte"
  },
  entityNames: {
    guardian: "§2Guardian_",
    playerCorpse: "pog:player_corpse",
    snowGolem: "minecraft:snow_golem",
    ironGolem: "minecraft:iron_golem",
    witherSkeleton: "minecraft:wither_skeleton",
    standingBanner: "minecraft:standing_banner"
  },
  effects: {
    absorption: "absorption",
    resistance: "resistance",
    regeneration: "regeneration",
    levitation: "levitation",
    nightVision: "night_vision",
    darkness: "darkness",
    weakness: "weakness",
    slowness: "slowness",
    nausea: "nausea",
    blindness: "blindness",
    hunger: "hunger",
    poison: "poison",
    web: "web",
    fireball: "fireball",
    lightningBolt: "lightning_bolt",
    explosion: "explosion",
    knockback: "knockback",
    attract: "attract",
    waterBreathing: "water_breathing",
    wither: "wither",
    resistance: "resistance",
    strength: "strength",
    invisibility: "invisibility"
  },
  itemTypes: {
    boneDust: "pog:bone_dust", // Asegúrate de que este identificador sea válido
    decayedBone: "pog:decayed_bone", // Asegúrate de que este identificador sea válido
    diamondTeleport: "pog:diamontteleport" // Asegúrate de que este identificador sea válido
  },
  formTitles: {
    question: "form.title.question",
    explanation: "form.body.explain"
  },
  customNames: {
    default1: "§6§k",
    default2: "§c§k",
    default3: "§c§l§k"
  }
};

const Constants = {
  InfinityDuration: 9999,
  DefaultEffectDuration: 3000
};

// Crear un objeto simple en lugar de una interfaz
function createCustomVector(x, y, z) {
  return { x, y, z };
}

let playerLevel = 0;
let playerDie;
let nameGuardians;
let playerLocation;
let strCoord;

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (!deadEntity.name) return;

  const dimension = deadEntity.dimension;
  playerDie = deadEntity;
  playerLocation = createCustomVector(deadEntity.location.x, deadEntity.location.y, deadEntity.location.z);
  strCoord = `${dimension.id}, ${Math.round(playerLocation.x)} ${Math.round(playerLocation.y)} ${Math.round(playerLocation.z)}`;
  const dName = TextConstants.dimensionNames[dimension.id] || dimension.id;

  try {
    const entity = dimension.spawnEntity(TextConstants.entityNames.playerCorpse, playerLocation);

    // Manejar la colocación de bloques de una manera alternativa si es necesario

    spawnWitherSkeletonIfNeeded(dimension, playerLocation, deadEntity.nameTag);

    nameGuardians = `${TextConstants.entityNames.guardian}${deadEntity.nameTag}`;
    spawnGuardiansIfNeeded(dimension, playerLocation, nameGuardians);

    spawnIronGolemIfNeeded(dimension, playerLocation, nameGuardians);

    entity.addTag(deadEntity.nameTag);
    entity.nameTag = `§6${deadEntity.nameTag}`;
    playerLevel = deadEntity.level;

    deadEntity.sendMessage({
      rawtext: [{
        translate: TextConstants.statusMessages.playerDied,
        with: [
          `${deadEntity.nameTag}`,
          `${Math.round(deadEntity.location.x)}`,
          `${Math.round(deadEntity.location.y)}`,
          `${Math.round(deadEntity.location.z)}`,
          `${dName}`
        ]
      }]
    });

    deadEntity.runCommandAsync(`tell @a ${dName}, ${Math.round(deadEntity.location.x)} ${Math.round(deadEntity.location.y)} ${Math.round(deadEntity.location.z)}`);
    applyEffectsIfNeeded(deadEntity);
  } catch (error) {
    console.error(`Error spawning entity: ${error.message}`);
  }
});

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
  if (!hitEntity || !damagingEntity) {
    console.error("hitEntity or damagingEntity is undefined");
    return;
  }

  if (hitEntity.typeId === TextConstants.entityNames.playerCorpse) {
    showBountyTierPage(damagingEntity, hitEntity);
  }
});

function showBountyTierPage(damagingEntity, hitEntity) {
  if (!damagingEntity?.nameTag || !hitEntity?.nameTag) {
    console.error("damagingEntity or hitEntity does not have a nameTag");
    return;
  }

  const form = new ActionFormData()
    .title(TextConstants.formTitles.question)
    .body(TextConstants.formTitles.explanation);

  const dimension = hitEntity.dimension;
  if (hitEntity.hasTag(damagingEntity.nameTag) || damagingEntity.nameTag === 'iHiram2572') {
    form.button(TextConstants.buttonLabels.eliminate)
      .button(TextConstants.buttonLabels.keep);
    if (damagingEntity.nameTag === 'iHiram2572') form.button(TextConstants.buttonLabels.forceElimination);

    form.show(damagingEntity).then(response => handleFormResponse(response, dimension, hitEntity));
  } else {
    form.button(TextConstants.statusMessages.notOwner).show(damagingEntity);
  }
}

function handleFormResponse(response, dimension, hitEntity) {
  const divisor = random(3, 5);
  if (response.selection === 0) {
    handleEntityElimination(hitEntity, divisor, dimension);
  } else if (response.selection === 1) {
    if (playerDie) {
      playerDie.sendMessage(TextConstants.statusMessages.mustDestroyTomb);
    }
  } else if (response.selection === 2) {
    handleForcedEntityElimination(hitEntity, dimension);
  }
}

function handleEntityElimination(hitEntity, divisor, dimension) {
  hitEntity.runCommandAsync(`xp ${playerLevel / divisor}l @p`);
  if (playerDie) {
    playerDie.sendMessage(TextConstants.statusMessages.conservedXP.replace("%", Math.floor((1 / divisor) * 100).toString()));
  }
  playerLevel = 0;
  hitEntity.triggerEvent('entity_transform');
  hitEntity.runCommandAsync(`kill @e[name="${nameGuardians}"]`);
}

function handleForcedEntityElimination(hitEntity, dimension) {
  hitEntity.triggerEvent('entity_transform');
  hitEntity.runCommandAsync(`kill @e[name=${nameGuardians},type=${TextConstants.entityNames.playerCorpse}]`);
  hitEntity.runCommandAsync(`kill @e[name="${nameGuardians}"]`);
  if (playerDie) {
    playerDie.sendMessage(TextConstants.statusMessages.eliminated);
  }
}

function spawnGuardiansIfNeeded(dimension, location, nameGuardians) {
  if (shouldSpawnGuardian()) {
    spawnGuardian(dimension, location, nameGuardians);
  }
}

function spawnWitherSkeletonIfNeeded(dimension, location, playerName) {
  if (shouldSpawnWitherSkeleton()) {
    const witherSkeleton = dimension.spawnEntity(TextConstants.entityNames.witherSkeleton, location);
    witherSkeleton.nameTag = `§4${playerName}§k`;
  }
}

function spawnIronGolemIfNeeded(dimension, location, nameGuardians) {
  if (shouldSpawnIronGolem()) {
    const ironGolem = dimension.spawnEntity(TextConstants.entityNames.ironGolem, location);
    applyEffects(ironGolem, Constants.InfinityDuration, 1);
    ironGolem.nameTag = nameGuardians;
  }
}

function spawnGuardian(dimension, location, nameGuardians) {
  for (let i = 0; i < 2; i++) {
    const snowGolem = dimension.spawnEntity(TextConstants.entityNames.snowGolem, location);
    applyEffects(snowGolem, Constants.InfinityDuration, 2);
    snowGolem.nameTag = nameGuardians;
  }
}

function applyEffects(entity, duration, amplifier) {
  entity.addEffect(TextConstants.effects.absorption, duration, { amplifier: amplifier });
  entity.addEffect(TextConstants.effects.resistance, duration, { amplifier: amplifier });
  entity.addEffect(TextConstants.effects.regeneration, duration, { amplifier: amplifier });
}

function applyEffectsIfNeeded(player) {
  if (shouldApplyPlayerEffects()) {
    applyEffects(player, Constants.DefaultEffectDuration, random(1, 2));
  }
}

function shouldSpawnGuardian() {
  return random(1, 1000) % 2 === 0 && random(1, 1000) <= 600;
}

function shouldSpawnWitherSkeleton() {
  return random(1, 1000) % 2 === 0 && random(1, 1000) <= 100;
}

function shouldSpawnIronGolem() {
  return random(1, 1000) <= 200;
}

function shouldApplyPlayerEffects() {
  return random(1, 1000) <= 500;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (!initialSpawn) {
    const coords = strCoord.split(',')[1].split(' ').join(' ');
    const inventory = player.getComponent("minecraft:inventory");
    const boneDust = new ItemStack(TextConstants.itemTypes.boneDust, 1);
    boneDust.nameTag = coords;
    inventory.container.addItem(boneDust);
    inventory.container.addItem(new ItemStack(TextConstants.itemTypes.decayedBone, 1));
  }
});

world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
  if (itemStack.typeId === TextConstants.itemTypes.diamondTeleport) {
    handleTeleportation(source);
  }
});

function handleTeleportation(player) {
  const inventory = player.getComponent("minecraft:inventory");

  // Obtener el primer ítem en el inventario del jugador
  const firstItem = inventory.container.getItem(0);  // Aquí 0 representa la primera ranura del inventario

  if (firstItem && firstItem.typeId === TextConstants.itemTypes.boneDust) {
    const form = new ActionFormData()
      .title(TextConstants.formTitles.question)
      .body(TextConstants.formTitles.explanation);

    // Extraer y convertir las coordenadas desde el nameTag
    const coords = firstItem.nameTag.trim().split(' ').map(c => parseFloat(c));

    // Validar que tenemos exactamente 3 coordenadas y todas sean números válidos
    if (coords.length !== 3 || coords.some(isNaN)) {
      player.sendMessage("Error: Coordenadas inválidas.");
      return;
    }

    const [x, y, z] = coords;

    if (player.level >= 5) {
      form.button(`${TextConstants.buttonLabels.teleport} ${x} ${y} ${z}`).show(player).then(response => {
        if (response.selection === 0) {
          player.runCommandAsync(`tp @s ${x} ${y} ${z}`);
          player.runCommandAsync('clear @s pog:diamontteleport 0 1');
          inventory.container.setItem(0, new ItemStack(TextConstants.itemTypes.decayedBone, 1));  // Reemplaza el primer ítem
          player.addLevels(-3);
        }
      });
    } else {
      form.button(TextConstants.statusMessages.requires5Levels).show(player);
    }
  }
}
