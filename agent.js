const PACKAGES = [
  { id: 'maps-basic', service: 'ปักหมุด Google Maps แบบไม่ยืนยันธุรกิจ', price: 500, days: '1 วัน', instant: true },
  { id: 'maps-verified', service: 'ปักหมุด Google Maps + ยืนยันธุรกิจ', price: 1000, days: '2 วัน', instant: true },
  { id: 'local-seo', service: 'ทำอันดับ Google Maps / Local SEO', price: 1900, days: 'ตามการประเมิน', instant: false },
  { id: 'facebook-page', service: 'สร้าง Facebook Page', price: 500, days: '1–3 วัน', instant: true },
  { id: 'line-oa', service: 'สร้าง LINE OA', price: 500, days: '1–3 วัน', instant: true },
];

function baht(n) { return `${n.toLocaleString('th-TH')} บาท`; }

function analyzeMessage(message = '') {
  const text = String(message).toLowerCase();
  const asksMaps = /google\s*(maps|map)|กูเกิล\s*แมป|ปักหมุด|พิกัด|เช็คอิน/.test(text);
  const asksRank = /อันดับ|ติดค้นหา|ใกล้ฉัน|local\s*seo|seo/.test(text);
  const asksFacebook = /facebook|เฟสบุ๊ค|เพจ/.test(text);
  const asksLine = /line\s*oa|ไลน์/.test(text);
  const risky = /แก้ไข|โดนระงับ|ระงับ|กู้คืน|หาย|แฮก|แฮกเกอร์|ย้ายสิทธิ์|บ้าน|ไม่มีหน้าร้าน/.test(text);
  const matched = [];
  if (asksRank) matched.push(PACKAGES.find(p => p.id === 'local-seo'));
  else if (asksMaps) matched.push(PACKAGES.find(p => p.id === 'maps-verified'));
  if (asksFacebook) matched.push(PACKAGES.find(p => p.id === 'facebook-page'));
  if (asksLine) matched.push(PACKAGES.find(p => p.id === 'line-oa'));
  return { matched, risky, needsOwnerApproval: risky || matched.length === 0, confidence: matched.length ? 0.9 : 0.35 };
}

function buildReply(message) {
  const result = analyzeMessage(message);
  if (result.needsOwnerApproval) {
    return {
      status: 'needs_owner', analysis: result,
      reply: 'ขอรายละเอียดเพิ่มเติมนิดนึงครับ รบกวนส่งลิงก์ Google Maps หรือแคปหน้าจอปัญหาที่พบมาได้เลยครับ เดี๋ยวผมตรวจสอบก่อนว่าแก้ไขได้ไหมและประเมินราคาให้ครับ'
    };
  }
  const lines = result.matched.map(p => `• ${p.service} ${baht(p.price)} ใช้เวลาประมาณ ${p.days}`);
  return {
    status: 'ready_to_quote', analysis: result,
    reply: `จากที่แจ้งมา แนะนำบริการดังนี้ครับ\n${lines.join('\n')}\n\nหากตรงกับที่ต้องการ แจ้งได้เลยครับ ผมจะส่งรายละเอียดเพื่อเริ่มงานให้ทันที`
  };
}

module.exports = { PACKAGES, analyzeMessage, buildReply };
