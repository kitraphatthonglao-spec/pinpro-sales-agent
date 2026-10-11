const http = require('http');
const crypto = require('crypto');
const { buildReply } = require('./agent');

const PORT = Number(process.env.PORT || 3000);
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'change-this-token';
const APP_SECRET = process.env.META_APP_SECRET || '';
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || '';

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
function privacyPolicy(res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>นโยบายความเป็นส่วนตัว | PinPro Sales Agent</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;padding:0 20px;line-height:1.7;color:#202124}h1{color:#173b73}h2{margin-top:28px}</style></head><body><h1>นโยบายความเป็นส่วนตัว</h1><p>ปรับปรุงล่าสุด: 10 ตุลาคม 2026</p><p>PinPro Sales Agent เป็นระบบช่วยจัดการและตอบข้อความลูกค้าของเพจ PinPro โดยใช้ข้อมูลที่ผู้ใช้ส่งเข้ามาทาง Messenger เพื่อช่วยวิเคราะห์ความต้องการและตอบกลับตามบริการของเรา</p><h2>ข้อมูลที่เราใช้งาน</h2><p>เราอาจประมวลผลชื่อผู้ใช้ รหัสการสนทนา และข้อความที่ผู้ใช้ส่งมายังเพจ เพื่อให้ระบบตอบกลับและให้บริการได้</p><h2>การใช้ข้อมูล</h2><p>ใช้เพื่อสื่อสารกับลูกค้า วิเคราะห์ความต้องการ เสนอข้อมูลบริการ และปรับปรุงการให้บริการเท่านั้น เราไม่ขายข้อมูลส่วนบุคคลให้บุคคลอื่น</p><h2>การจัดเก็บและความปลอดภัย</h2><p>เราจำกัดการเข้าถึงข้อมูลไว้เฉพาะผู้ดูแลระบบและผู้ให้บริการที่จำเป็นต่อการทำงานของระบบ และใช้มาตรการที่เหมาะสมเพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต</p><h2>การติดต่อ</h2><p>หากต้องการสอบถามหรือขอลบข้อมูล กรุณาติดต่อเจ้าของเพจ PinPro ผ่าน Messenger ของเพจ หรืออีเมล raphatkeroro@gmail.com</p><h2>การเปลี่ยนแปลงนโยบาย</h2><p>เราอาจปรับปรุงนโยบายนี้เมื่อมีการเปลี่ยนแปลงการให้บริการ โดยจะแสดงฉบับล่าสุดบนหน้านี้</p></body></html>`);
}
function readBody(req) {
  return new Promise((resolve, reject) => { let s=''; req.on('data', c => s += c); req.on('end', () => resolve(s)); req.on('error', reject); });
}
function validSignature(raw, signature) {
  if (!APP_SECRET) return true; // required before production use
  if (!signature || !signature.startsWith('sha256=')) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
async function sendMessengerMessage(recipientId, text) {
  if (!PAGE_ACCESS_TOKEN) return { skipped: true, reason: 'META_PAGE_ACCESS_TOKEN is not configured' };
  const response = await fetch(`https://graph.facebook.com/v24.0/me/messages?access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  });
  return { status: response.status, body: await response.json() };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/privacy-policy') return privacyPolicy(res);
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'sales-agent-backend' });
  if (req.method === 'GET' && url.pathname === '/webhook') {
    if (url.searchParams.get('hub.verify_token') !== VERIFY_TOKEN) return json(res, 403, { error: 'invalid verify token' });
    res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end(url.searchParams.get('hub.challenge') || '');
  }
  if (req.method === 'POST' && url.pathname === '/analyze') {
    try { const body = JSON.parse(await readBody(req)); return json(res, 200, buildReply(body.message)); }
    catch { return json(res, 400, { error: 'invalid JSON' }); }
  }
  if (req.method === 'POST' && url.pathname === '/webhook') {
    try {
      const raw = await readBody(req);
      if (!validSignature(raw, req.headers['x-hub-signature-256'])) return json(res, 403, { error: 'invalid signature' });
      const body = JSON.parse(raw);
      console.log('Meta webhook event:', JSON.stringify(body));
      const results = [];
      for (const entry of body.entry || []) for (const event of entry.messaging || []) {
        if (event.message?.text && event.sender?.id) {
          const result = buildReply(event.message.text);
          results.push(await sendMessengerMessage(event.sender.id, result.reply));
        }
      }
      return json(res, 200, { received: true, results });
    } catch { return json(res, 400, { error: 'invalid JSON' }); }
  }
  json(res, 404, { error: 'not found' });
});

server.listen(PORT, () => console.log(`Sales Agent backend listening on http://localhost:${PORT}`));
