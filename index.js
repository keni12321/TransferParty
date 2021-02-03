/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
const { Setting, SettingsObject } = require("SettingsManager/SettingsManager.js")
const TransferPartyKeyBind = new KeyBind ("Transfer Party", Keyboard.KEY_NONE, ".TransferParty")

import PersistentVariableFactory from 'PersistentVariables/index';
const factory = new PersistentVariableFactory('TransferParty');

const Command = factory.create('Command', "");
const Name = factory.create('Name', "");
var FriendName = Name.get()
var CustomCommand = Command.get()

var ding = new Sound({source: "ding.ogg",});

const TPSettings = new SettingsObject("TransferParty", [
    {
        name:"Transfer Party Settings",
        settings: [
            new Setting.Toggle("Transfer Party",true),
            new Setting.Button("/tp /transferparty /tparty works.", "", () => {}),
            new Setting.Toggle("Play Sound When Transfer Completed",true),
            new Setting.Toggle("Disable Message Alert When Transfer Completed",false),
            new Setting.Toggle("Transfer To Random Member",false),
            new Setting.Button("", "", () => {}),
            new Setting.Button("&eDiscord Support Server:", "&9https://discord.gg/G6KxSYE7sv", () => {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/G6KxSYE7sv")); // Dungeon Utilities
            })
        ]
    },
    {
        name:"Custom Command",
        settings: [
            new Setting.Toggle("Custom Command",false),
            new Setting.Button("^ Will Execute A Custom Command When No Member Is Presence In The Party", "", () => {}),
            new Setting.Button("^ can be configured in /tpcustom <Your Custom Command>", "", () => {}),
            new Setting.Button("like /gc owo, /p transfer to someone, or anything", "", () => {}),
            new Setting.Button(`Do </tpcustom command> To Find Your Current Command Set`, "", () => {})
        ]
    },
    {
        name:"Friend",
        settings: [
            new Setting.Toggle("Transfer To Friend",false),
            new Setting.Button("^ Will Transfer To Friend When Friend Is Presence", "", () => {}),
            new Setting.Button("^ can be configured in /transferfriend <Your Friend's Name>", "", () => {}),
            new Setting.Button(`Do </tranferfriend name> To Find Your Friend's Name Currently Set`, "", () => {})
        ]
    }
])
TPSettings.setCommand("th").setSize(500, 200)
Setting.register(TPSettings)

// code base soopyAddons
let commandsQueue = []
let commandsQueueLast = new Date().getTime();
register("Tick", function () {
    if (new Date().getTime() - commandsQueueLast > 500) {
        commandsQueueLast = new Date().getTime()
        if (commandsQueue.length > 0) {
            let thing = commandsQueue.shift()
            if (thing !== "") {
                ChatLib.say(thing)
            }
        }
    }
    if (TransferPartyKeyBind.isPressed()) {
        TransferParty();
    }
})

register("command",  (...CustomCommandd) => { 
    if (TPSettings.getSetting("Custom Command", "Custom Command") === false) {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Enable The Function On /th First")
    }
    let x = CustomCommandd.join(" ")
    if (x === "") {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Please Enter A Custom Command")
    }
    if (x === "command") {
        return ChatLib.chat(`§c[§fTransferParty§c]§f §a●§f Your Command Is ${CustomCommand}`)
    }
    if (x.indexOf('/') === -1) {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Please Enter A §4Valid§f Custom Command")
    }
    Command.set(x)
    new TextComponent("§c[§fTransferParty§c]§f §a●§f Your Custom Command Have Been Set! &8(Hover)").setHoverValue(`Your Command is ${x}`).chat()
}).setName("tpcustom")

register("command", (...FriendNamee) => {
    if (TPSettings.getSetting("Friend", "Transfer To Friend") === false) {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Enable The Function On /th First")
    }
    else if(TPSettings.getSetting("Friend", "Transfer To Friend") === true){
    let y = FriendNamee.join(" ")
    if (y === "") {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Please Enter Your Friend's Name")
    }
    if (y === "name") {
        return ChatLib.chat(`§c[§fTransferParty§c]§f §a●§f Your Friend's Name Is ${FriendName}`)
    }
    Name.set(y)
    new TextComponent("§c[§fTransferParty§c]§f §a●§f Your Friend's Name Have Been Set! &8(Hover)").setHoverValue(`Your Friend's Name is ${y}`).chat()
}
}).setName("transferfriend")


register("command", () => {
    TransferParty();
}).setName("tp")

register("command", () => {
    TransferParty();
}).setName("transferparty")

register("command", () => {
    TransferParty();
}).setName("tparty")

lastAttemptTransferPartyTime = 0

function TransferParty() {
    if(TPSettings.getSetting("Transfer Party Settings", "Transfer Party")) {
    ChatLib.say("/pl")
    lastAttemptTransferPartyTime = new Date().getTime()
    IsPartyLeader = false
    HaveMember = false
    FriendPresence = false
    }
}

register("chat", (mode, names) => {

    if (new Date().getTime() - lastAttemptTransferPartyTime > 1000) {
        return;
    }

    if (names.includes(FriendName) && TPSettings.getSetting("Friend", "Transfer To Friend") === true && IsPartyLeader) {
        FriendPresence = true
        ChatLib.command("p transfer " + FriendName) 
            if(TPSettings.getSetting("Transfer Party Settings", "Disable Message Alert When Transfer Completed") === false) {
                setTimeout(() => {
                    ChatLib.chat("§c[§fTransferParty§c]§f §a●§f Transfer Done To Friend")
                }, 1000);
            }
            if(TPSettings.getSetting("Transfer Party Settings", "Play Sound When Transfer Completed") === true) {
                ding.play()
            }
        }

    if (mode === "Leader") {
        if (names.includes(Player.getName())) {
            IsPartyLeader = true
        }
        else if (!IsPartyLeader) {
            return setTimeout(() => {ChatLib.chat("§c[§fTransferParty§c]§f §c●§f You're Not The Party Leader")}, 10)
        }
    }

    if (mode === "Moderators") {
        setTimeout(() => {if (IsPartyLeader && HaveMember === false && TPSettings.getSetting("Custom Command", "Custom Command") === false && FriendPresence === false) {
            setTimeout(() => {ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Finding a Party Moderator To Transfer")}, 10)
            setTimeout(function(){TransferPartyMember(names)}, 10)
        }
        else if (TPSettings.getSetting("Custom Command", "Custom Command")) {
                if (x !== CustomCommand){
                    ChatLib.say(x)
                }
                if (x === CustomCommand){
                    ChatLib.say(CustomCommand)
                }
                setTimeout(() => {
                    new Message("§c[§fTransferParty§c]§f §a●§f Custom Command Completed").chat()
                }, 10)
            
        }}, 10)}

    if (mode === "Members") {
        HaveMember = true
        if (IsPartyLeader && FriendPresence === false) {
            setTimeout(function(){TransferPartyMember(names)}, 10)
        }
    }
}).setChatCriteria("Party ${mode}: ${names}")

function TransferPartyMember(names) {
    Arr = names.split(" ● ")
    Arr.pop()
    if(TPSettings.getSetting("Transfer Party Settings", "Transfer To Random Member")) {
        ArrString = Arr[Math.floor(Math.random() * Arr.length)]
    }
    if(TPSettings.getSetting("Transfer Party Settings", "Transfer To Random Member") === false) {
        ArrString = Arr.shift()
    }
    let ArrStringUnFormatted = ArrString.replace(/(\[[a-zA-Z0-9\+]+\])+? /g, "").replace(/(&[0123456789ABCDEFLMNOabcdeflmnor])|\[|\]| |\+/g, "")
            commandsQueue.push("/p transfer " + ArrStringUnFormatted)
            setTimeout(() => {
            CurrentTime = new Date().getTime()
            CurrentTimeString = CurrentTime-lastAttemptTransferPartyTime
            if(TPSettings.getSetting("Transfer Party Settings", "Disable Message Alert When Transfer Completed") === false) {
            new TextComponent("§c[§fTransferParty§c]§f §a●§f Transfer Complete").setHoverValue(`Transfer Done in ${CurrentTimeString} Milliseconds`).chat()
            }
            if(TPSettings.getSetting("Transfer Party Settings", "Play Sound When Transfer Completed") === true) {
               ding.play()
            }
        }, 1000)
}