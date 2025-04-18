console.warn("running");
import * as server from '@minecraft/server';
const world = server.world
world.events.EntityDieEventSignal.subscribe((evnt) => {
    const objPlayer = evnt.deadEntity;
    if (objPlayer.typeId = "minecraft:player") {
        console.warn('Murio');
        console.warn(objPlayer.typeId);
    }

})