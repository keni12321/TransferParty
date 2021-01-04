/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
const { Setting, SettingsObject } = require("SettingsManager/SettingsManager.js")
const TransferPartyKeyBind = new KeyBind ("Transfer Party", Keyboard.KEY_NONE, ".TransferParty")

var settings = JSON.parse(FileLib.read("TransferParty", "settings.json"))
if (settings == null) {
    defaultInfo = JSON.stringify({
        "Command":null,
    })
    FileLib.write("TransferParty","settings.json", defaultInfo)
    settings = JSON.parse(FileLib.read("TransferParty", "settings.json"))
}
CustomCommand = settings.Command

const TPSettings = new SettingsObject("TransferParty", [
    {
        name:"Transfer Party Settings",
        settings: [
            new Setting.Toggle("Transfer Party",true),
            new Setting.Button("/tp /transferparty /tparty works.", "", () => {}),
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
            new Setting.Button("^ can be configured in /tc , /tpcustom <Custom Command>", "", () => {}),
            new Setting.Button("like /gc owo, /p transfer to someone, or anything", "", () => {}),
            new Setting.Button(`Current Command is: §6${CustomCommand}§f`, "", () => {})
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
    TPCustomCommand(CustomCommandd)
}).setName("tpcustom")

register("command",  (...CustomCommandd) => { 
    TPCustomCommand(CustomCommandd)
}).setName("tc")

register("command", () => {
    TransferParty();
}).setName("tp")

register("command", () => {
    TransferParty();
}).setName("transferparty")

register("command", () => {
    TransferParty();
}).setName("tparty")

function TPCustomCommand(CustomCommand) { // Dungeon Secrets
    let x = CustomCommand.join(" ")
    if (x === "") {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Please Enter A Custom Command")
    }
    if (x.indexOf('/') === -1) {
        return ChatLib.chat("§c[§fTransferParty§c]§f §c●§f Please Enter A Valid Custom Command")
    }
    
    settings.Command = x
    newSettings = JSON.stringify({
        "Command":x,
    })
    FileLib.write("TransferParty", "settings.json", newSettings)
    new TextComponent("§c[§fTransferParty§c]§f §a●§f Your Custom Command Have Been Set!").setHoverValue(`Your Command is ${x}`).chat()
}

lastAttemptTransferPartyTime = 0

function TransferParty() {
    if(TPSettings.getSetting("Transfer Party Settings", "Transfer Party"))
    ChatLib.say("/pl")
    lastAttemptTransferPartyTime = new Date().getTime()
    IsPartyLeader = false
    HaveMember = false
}
let IsPartyLeader = false
let HaveMember = false

register("chat", (mode, names) => {

    if (new Date().getTime() - lastAttemptTransferPartyTime > 1000) {
        return;
    }

    if (mode === "Leader") {
        if (names.includes(Player.getName())) {
            IsPartyLeader = true
        }
        else if (!IsPartyLeader) {
            setTimeout(() => {ChatLib.chat("§c[§fTransferParty§c]§f §c●§f You're Not The Party Leader")}, 10)
        }
    }

    if (mode === "Moderators") {
        if (IsPartyLeader && HaveMember === false && TPSettings.getSetting("Transfer Party Settings", "Custom Command") === false) {
            setTimeout(() => {ChatLib.chat("§c[§fTransferParty§c]§f §c●§f No Party Member Was Found, Finding a Party Moderator To Transfer")}, 10)
            setTimeout(function(){TransferPartyMember(names)}, 10)
        }
        if (TPSettings.getSetting("Custom Command", "Custom Command")) {
                commandsQueue.push(CustomCommand)
                setTimeout(() => {
                    new Message("§c[§fTransferParty§c]§f §a●§f Custom Command Completed").chat()
                }, 10)
            }
        }

    if (mode === "Members") {
        HaveMember = true
        if (IsPartyLeader) {
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
    if(TPSettings.getSetting("Transfer Party Settings", "Transfer To Random Member") == false) {
        ArrString = Arr.shift()
    }
    let ArrStringUnFormatted = ArrString.replace(/(\[[a-zA-Z0-9\+]+\])+? /g, "").replace(/(&[0123456789ABCDEFLMNOabcdeflmnor])|\[|\]| |\+/g, "")
            commandsQueue.push("/p transfer " + ArrStringUnFormatted)
            setTimeout(() => {
            CurrentTime = new Date().getTime()
            CurrentTimeString = CurrentTime-lastAttemptTransferPartyTime
            new TextComponent("§c[§fTransferParty§c]§f §a●§f Transfer Complete").setHoverValue(`Transfer Done in ${CurrentTimeString} Milliseconds`).chat()
            }, 1000)
}