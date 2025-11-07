const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    default: Elitechwiz_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
 };
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    let responded = false; // Flag to prevent multiple triggers
    async function ELITECHWIZ_MD_PAIR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/'+id)
        try {
            let Pair_Code_By_Elitechwiz_Tech = Elitechwiz_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: Browsers.macOS("Desktop")
            });
            if(!Pair_Code_By_Elitechwiz_Tech.authState.creds.registered && !responded) {
                await delay(1500);
                num = num.replace(/[^0-9]/g,'');
                const code = await Pair_Code_By_Elitechwiz_Tech.requestPairingCode(num)
                if(!res.headersSent){
                    await res.send({code});
                    responded = true;
                }
            }
            Pair_Code_By_Elitechwiz_Tech.ev.on('creds.update', saveCreds)
            Pair_Code_By_Elitechwiz_Tech.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect
                } = s;
                if (connection == "open" && !responded) {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await Pair_Code_By_Elitechwiz_Tech.sendMessage(Pair_Code_By_Elitechwiz_Tech.user.id, { text: '' + b64data });

                    let ELITECHWIZ_MD_TEXT = `
*_Pair Code Connected by ELIAH TECH_*
*_Made With 🤍_*
━━━━━━━━━━━━━━━━━━━━━━
🌟 *『 WOW! You've Chosen EliTechWiz-V4 』*
✨ _You Have Completed the First Step to Deploy a WhatsApp Bot._
━━━━━━━━━━━━━━━━━━━━━━

🔗 *RESOURCES & SUPPORT:*

📺 *YouTube:* _youtube.com/@eliahhango_
👤 *Owner:* _https://wa.me/255688164510_
💻 *Repo:* _https://github.com/Eliahhango/EliTechWiz-V4_
👥 *Group:* _https://chat.whatsapp.com/CK55DhCbb2q6UihlzPBTkP_
🚀 *Channel:* _Join our exclusive WhatsApp Channel for the latest tech updates, tips, and innovation inspiration!_
👉 https://whatsapp.com/channel/0029VaeEYF0BvvsZpaTPfL2s
🧩 *Plugins:* _https://github.com/Eliahhango/EliTechWiz-V4-PLUGINS_

━━━━━━━━━━━━━━━━━━━━━━

_Don't Forget To Give Star To My Repo! ⭐_
`;
                    await Pair_Code_By_Elitechwiz_Tech.sendMessage(Pair_Code_By_Elitechwiz_Tech.user.id,{text:ELITECHWIZ_MD_TEXT},{quoted:session})

                    await delay(100);
                    await Pair_Code_By_Elitechwiz_Tech.ws.close();
                    responded = true;
                    return await removeFile('./temp/'+id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401 && !responded) {
                    await delay(10000);
                    ELITECHWIZ_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./temp/'+id);
            if(!res.headersSent){
                await res.send({code:"Service Unavailable"});
            }
        }
    }
    return await ELITECHWIZ_MD_PAIR_CODE()
});
module.exports = router
