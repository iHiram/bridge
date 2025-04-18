import { world } from "@minecraft/server";
import { system } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
const Infinity = 10000000;
let playerG;


function detectEvents() {
    let players = world.getPlayers();
    for (let player of players) {
        let invent = player.getComponent("minecraft:equippable");
        let health = player.getComponent("minecraft:health");
        let slo = invent.getEquipmentSlot("Head");
        let items = slo.getItem();
        let irand = random(1, 1000);
        if (health != undefined) {
            if (health < 2 && irand <= (50)) {
                irand = random(1, 100);
                player.addEffect('regeneration', irand, { 'amplifier': random(1, 2), showParticles: true })
                player.playSound('random.totem')
            }
        }
        if (items != undefined) {
            if (items.typeId == "bridge:netherite_nv_helmet" && player.hasTag("HelmetNV_ON") == false) {
                player.removeTag("HelmetNV_Off")
                player.addTag("HelmetNV_ON")
                player.addEffect("night_vision", 320)
            } else if (items.typeId
                != "bridge:netherite_nv_helmet" && items.typeId
                != "bridge:netherite_nv_helmet_notch") {
                let effc = player.getEffect("night_vision");
                if (effc != undefined)
                    if (effc.duration > 80) {
                        player.runCommandAsync('effect @s night_vision 0')
                        player.runCommandAsync('effect @s night_vision 4')
                        player.removeTag("HelmetNV_ON_notch")
                        player.removeTag("HelmetNV_ON")
                        player.addTag("HelmetNV_Off")
                        player.addTag("HelmetNV_Off_notch")

                    }

            } else if (items.typeId == "bridge:netherite_nv_helmet_notch" && player.hasTag("HelmetNV_ON")) {
                player.addTag("HelmetNV_Off")
                player.removeTag("HelmetNV_ON")
            }
            if (items.typeId == "bridge:netherite_nv_helmet_notch" && player.hasTag("HelmetNV_ON_notch") == false) {
                player.removeTag("HelmetNV_Off_notch")
                player.addTag("HelmetNV_ON_notch")
                player.addEffect("night_vision", Infinity)
            } else if (!player.hasTag("HelmetNV_Off_notch") && items.typeId
                != "bridge:netherite_nv_helmet" && items.typeId
                != "bridge:netherite_nv_helmet_notch") {
                player.addTag("HelmetNV_Off_notch")
                player.removeTag("HelmetNV_ON_notch")
                player.runCommandAsync('effect @s night_vision 0')
                player.runCommandAsync('effect @s night_vision 4')
            } else if (items.typeId == "bridge:netherite_nv_helmet" && player.hasTag("HelmetNV_ON_notch")) {
                player.addTag("HelmetNV_Off_notch")
                player.removeTag("HelmetNV_ON_notch")
                player.runCommandAsync('effect @s night_vision 0').then(() => {
                    player.addEffect("night_vision", 320)
                })
            }
        } else {

            if (player.hasTag("HelmetNV_ON_notch") || player.hasTag("HelmetNV_ON")) {
                let effc = player.getEffect("night_vision");
                if (effc != undefined)
                    if (effc.duration > 80) {
                        player.runCommandAsync('effect @s night_vision 0')
                        player.runCommandAsync('effect @s night_vision 4')
                        player.removeTag("HelmetNV_ON_notch")
                        player.removeTag("HelmetNV_ON")
                        player.addTag("HelmetNV_Off")
                        player.addTag("HelmetNV_Off_notch")

                    }

            }
        }
    }
}
system.runInterval(detectEvents)
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}