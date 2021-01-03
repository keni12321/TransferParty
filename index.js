/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
const { Setting, SettingsObject } = require("SettingsManager/SettingsManager.js")
const TransferPartyKeyBind = new KeyBind ("Transfer Party", Keyboard.KEY_NONE, ".TransferParty")
module.exports = {};

var TPSettings = new SettingsObject("TransferParty", [
    {
        name:"Transfer Party Settings",
        settings: [
            new Setting.Toggle("Transfer Party",true),
            new Setting.Button("/tp /transferparty /tparty works", "", () =>{}),
            new Setting.Toggle("Transfer To Random Member",false),
            new Setting.Button("", "", () => {}),
            new Setting.Button("&eDiscord Support Server:", "&9https://discord.gg/G6KxSYE7sv", () => {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/G6KxSYE7sv")); // Dungeon Utilities
            })
        ]
    }
])
Setting.register(TPSettings)

register("command", () => {
	TPSettings.setSize(Renderer.screen.getWidth() / 2   , Renderer.screen.getHeight() / 2);
    TPSettings.open();
}).setName("th");

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
    if(TPSettings.getSetting("Transfer Party Settings", "Transfer Party"))
    ChatLib.say("/pl")
    lastAttemptTransferPartyTime = new Date().getTime()
    IsPartyLeader = false
    HaveMember = false
}

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
        if (IsPartyLeader && !HaveMember) {
            setTimeout(() => {ChatLib.chat("§c[§fTransferParty§c]§f §c●§f No Party Member Was Found, Finding a Party Moderator To Transfer")}, 10)
            setTimeout(function(){TransferPartyMember(names)}, 10)
    }}

    if (mode === "Members") {
        HaveMember = true
        if (IsPartyLeader) {
            setTimeout(function(){TransferPartyMember(names)}, 10)
    }}
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