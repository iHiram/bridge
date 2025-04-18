console.warn("running");
import { world } from 'mojang-minecraft';
world.events.EntityDieEventSignal.subscribe((evnt) => {
    const objPlayer = evnt.deadEntity;
    if (objPlayer.typeId = "minecraft:player") {
        console.warn("jajaja");
    }
})