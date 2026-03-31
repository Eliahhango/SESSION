const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const express = require('express');
const fs = require('fs');
const path = require('path');
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const TEMP_ROOT = process.env.TEMP_DIR || '/tmp';

function getSessionDir(id) {
    return path.join(TEMP_ROOT, 'session-temp', id);
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
 };
router.get('/', async (req, res) => {
    const id = makeid();
    let num = String(req.query.number || '').replace(/[^0-9]/g, '');
    let codeSent = false;
    let connectionHandled = false;
    function log(msg) { try { console.log('[PAIR]', msg); } catch {} }

    const requestTimeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).send({ code: 'Request timed out. Please try again.' });
        }
    }, 25000);

    function markResponded() {
        clearTimeout(requestTimeout);
    }

    function getCandidateJids(sock, rawNumber) {
        const fromSocket = sock?.user?.id ? jidNormalizedUser(sock.user.id) : null;
        const fromInput = rawNumber ? `${rawNumber}@s.whatsapp.net` : null;
        return [...new Set([fromSocket, fromInput].filter(Boolean))];
    }

    async function ELITECHWIZ_MD_PAIR_CODE() {
        const sessionDir = getSessionDir(id);
        ensureDir(sessionDir);
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(sessionDir)
        try {
            let Pair_Code_By_Elitechwiz_Tech = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: Browsers.macOS("Desktop")
            });
            Pair_Code_By_Elitechwiz_Tech.ev.on('creds.update', saveCreds)
            Pair_Code_By_Elitechwiz_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (!codeSent && !state.creds.registered && (connection === 'connecting' || !!qr)) {
                    await delay(1200);
                    if (!num || num.length < 11) {
                        if (!res.headersSent) {
                            res.status(400).send({ code: 'Invalid number' });
                            markResponded();
                        }
                        await Pair_Code_By_Elitechwiz_Tech.ws.close();
                        return await removeFile(sessionDir);
                    }

                    const code = await Pair_Code_By_Elitechwiz_Tech.requestPairingCode(num)
                    codeSent = true;
                    if(!res.headersSent){
                        await res.send({code});
                        markResponded();
                    }
                }

                if (connection == "open" && !connectionHandled) {
                    connectionHandled = true;
                    await delay(5000);
                    let data = fs.readFileSync(path.join(sessionDir, 'creds.json'));
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');

                    const recipientJids = getCandidateJids(Pair_Code_By_Elitechwiz_Tech, num);
                    let session;
                    let deliveredJid;
                    let deliveryError = null;
                    let waCheck = null;

                    // Check if number is on WhatsApp
                    try {
                        waCheck = await Pair_Code_By_Elitechwiz_Tech.onWhatsApp(num + "@s.whatsapp.net");
                        log(`onWhatsApp check for ${num}: ${JSON.stringify(waCheck)}`);
                        if (!waCheck || !waCheck[0]?.exists) {
                            throw new Error('Number is not on WhatsApp');
                        }
                    } catch (waErr) {
                        log(`onWhatsApp error: ${waErr}`);
                        if (!res.headersSent) {
                            res.status(400).send({ code: 'Number is not registered on WhatsApp.' });
                            markResponded();
                        }
                        await Pair_Code_By_Elitechwiz_Tech.ws.close();
                        return await removeFile(sessionDir);
                    }

                    // Try sending a test message first
                    for (const jid of recipientJids) {
                        try {
                            log(`Trying to send test message to ${jid}`);
                            await Pair_Code_By_Elitechwiz_Tech.sendMessage(jid, { text: 'Your WhatsApp session will be delivered shortly.' });
                            log(`Test message delivered to ${jid}`);
                            // Now send the session
                            session = await Pair_Code_By_Elitechwiz_Tech.sendMessage(jid, { text: '' + b64data });
                            deliveredJid = jid;
                            break;
                        } catch (sendErr) {
                            log(`Delivery failed to ${jid}: ${sendErr}`);
                            deliveryError = sendErr;
                        }
                    }

                    // Fallback: Pastebin if delivery failed
                    let pastebinUrl = null;
                    if (!session || !deliveredJid) {
                        try {
                            pastebinUrl = await pastebin.createPaste({
                                text: b64data,
                                title: `WhatsApp Session for ${num}`,
                                format: 'text',
                                privacy: 1
                            });
                            log(`Session uploaded to Pastebin: ${pastebinUrl}`);
                        } catch (pbErr) {
                            log(`Pastebin upload failed: ${pbErr}`);
                        }
                    }

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
                    if (deliveredJid && session) {
                        await Pair_Code_By_Elitechwiz_Tech.sendMessage(deliveredJid, { text: ELITECHWIZ_MD_TEXT }, { quoted: session });
                    } else if (pastebinUrl) {
                        if (!res.headersSent) {
                            res.status(200).send({ code: 'Session could not be delivered via WhatsApp. Here is your session link:', url: pastebinUrl });
                            markResponded();
                        }
                    } else {
                        if (!res.headersSent) {
                            res.status(500).send({ code: 'Failed to deliver session to WhatsApp number and could not upload to Pastebin.' });
                            markResponded();
                        }
                    }

                    await delay(100);
                    await Pair_Code_By_Elitechwiz_Tech.ws.close();
                    clearTimeout(requestTimeout);
                    return await removeFile(sessionDir);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    if (!res.headersSent) {
                        await res.status(503).send({ code: "Service Unavailable" });
                        markResponded();
                    }
                    await removeFile(sessionDir);
                }
            });
        } catch (err) {
            log("service restated: " + err);
            await removeFile(sessionDir);
            if(!res.headersSent){
                await res.send({code:"Service Unavailable"});
                markResponded();
            }
        }
    }
    return await ELITECHWIZ_MD_PAIR_CODE()
});
module.exports = router
