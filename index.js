const express = require("express");
const qrcode = require("qrcode");
const WhatsappService = require("./services/WhatsappService");
const MessageWrite = require("./rules/MessageWrite");
const Validator = require("./helper/Validator");
const app = express();
const wa = new WhatsappService.WhatsappService();
wa.Initialize();
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello, This is simple whatsapp server for internal use fast and reliable.');
});
app.get('/status', (req, res) => {
    res.send(wa.GetStatus());
});
app.get('/qr', (req, res) => {
    const body = "<html><head><title>Whatsapp QrCode</title><script>setTimeout(function(){window.location.reload();}, 1000);</script></head><body>@body</body></html>";
    const status = wa.GetStatus();
    if (status.isConnected) {
        const response = "<div><h1 style='text-align: center;' >Whatsapp Connected to " + status.phoneNumber + "</h1></div>";
        const result = body.replace('@body', response);
        res.send(result);
    }
    else {
        qrcode.toDataURL(wa.qrcode, (err, url) => {
            if (err) {
                const response = "<div><h1 style='text-align: center;' >" + err.message + "</h1></div></div>";
                const result = body.replace('@body', response);
                res.send(result);
            }
            else {
                const response = "<div><img style='display: block; margin-left: auto; margin-right: auto; width: 30%;' src='" + url + "' alt='whatsapp qrcode' /></div>";
                const result = body.replace('@body', response);
                res.send(result);
            }
        });
    }
});
app.post('/message', (req, res) => {
    (0, Validator.validator)(req.body, MessageWrite.MessageWrite, {}, (error, isValid) => {
        if (!isValid) {
            res.status(400);
            res.send({
                status: "failed",
                errors: error.errors
            });
        }
        else {
            const message = req.body.message;
            const phoneNumber = req.body.phoneNumber;
            wa.SendWhatsappSimpleMessage(phoneNumber, message);
            res.send({
                status: "success",
                errors: null
            });
        }
    });
});
app.post('/logout', (req, res) => {
    wa.Logout();
    res.send({
        status: "success",
        errors: null
    });
});
// run express
const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Apliksi Berhasi Berjalan'));
