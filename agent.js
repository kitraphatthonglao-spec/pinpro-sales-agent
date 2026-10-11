const PACKAGES = [
  { id: 'maps-basic', service: 'ปักหมุด Google Maps', price: 499, days: '1–2 วัน', instant: true },
  { id: 'maps-verified', service: 'ปักหมุด Google Maps + ยืนยันธุรกิจ', price: 1000, days: '2 วัน', instant: true },
  { id: 'local-seo', service: 'ทำอันดับ Google Maps / Local SEO', price: 1900, days: 'ตามการประเมิน', instant: false },
  { id: 'facebook-page', service: 'สร้าง Facebook Page', price: 500, days: '1–3 วัน', instant: true },
  { id: 'line-oa', service: 'สร้าง LINE OA', price: 500, days: '1–3 วัน', instant: true },
];

function baht(n) { return n.toLocaleString('th-TH') + ' บาท'; }

function analyzeMessage(message = '') {
  const text = String(message).toLowerCase();
  const asksMaps = /google\s*(maps|map)|กูเกิล\s*แมป|ปักหมุด|พิกัด|เช็คอิน/.test(text);
  const asksRank = /อันดับ|ติดค้นหา|ใกล้ฉัน|local\s*seo|seo/.test(text);
  const asksFacebook = /facebook|เฟสบุ๊ค|เพจ/.test(text);
  const asksLine = /line\s*oa|ไลน์/.test(text);
  const risky = /แก้ไข|โดนระงับ|ระงับ|กู้คืน|หาย|แฮก|แฮกเกอร์|ย้ายสิทธิ์|บ้าน|ไม่มีหน้าร้าน/.test(text);
  const matched = [];
  if (asksRank) matched.push(PACKAGES.find(p => p.id === 'local-seo'));
  else if (asksMaps) matched.push(PACKAGES.find(p => p.id === 'maps-basic'));
  if (asksFacebook) matched.push(PACKAGES.find(p => p.id === 'facebook-page'));
  if (asksLine) matched.push(PACKAGES.find(p => p.id === 'line-oa'));
  return { matched, risky, needsOwnerApproval: risky || matched.length === 0, confidence: matched.length ? 0.9 : 0.35 };
}

function buildReply(message) {
  const result = analyzeMessage(message);
  const text = String(message).toLowerCase();
  const asksOwnership = /มีหมุดแล้ว|หมุด.*แล้ว|อ้างสิทธิ์|เจ้าของหมุด|เป็นเจ้าของหมุด/.test(text);
  const mapNotFound = /ไม่พบหมุด|ไม่เจอหมุด|หา.*หมุด.*ไม่เจอ|ยังไม่มีหมุด|ไม่มีหมุด/.test(text);
  if (mapNotFound) return { status: 'ready_to_quote', analysis: result, reply: 'จากที่ตรวจสอบตามชื่อธุรกิจที่แจ้งมา ตอนนี้ยังไม่พบหมุดบน Google Maps ครับ\n\nมีแพ็กเกจให้เลือก 2 แบบครับ\n\nแพ็กเกจ 1: ปักหมุด Google Maps — 499 บาท\n\n• ลิงก์หมุด Google Maps\n• เพิ่มข้อมูลธุรกิจ\n• ระบุพิกัดให้ถูกต้อง\n• เพิ่มเบอร์โทรศัพท์\n• ลงภาพธุรกิจไม่เกิน 3 ภาพ\n• ชำระครั้งเดียว ไม่มีค่าใช้จ่ายเพิ่มเติม\n\nแพ็กเกจ 2: ปักหมุดพร้อมจัดการธุรกิจ — 1,000 บาท\n\n• ลิงก์หมุด Google Maps\n• เพิ่มข้อมูลธุรกิจและพิกัดให้ถูกต้อง\n• เพิ่มช่องทางติดต่อ เช่น เพจ เว็บไซต์ และเบอร์โทรศัพท์\n• ลงภาพธุรกิจไม่เกิน 10 ภาพ\n• สร้าง QR Code สำหรับรีวิวบน Google ให้ฟรี\n• ช่วยดำเนินการอ้างสิทธิ์ความเป็นเจ้าของตามขั้นตอนของ Google\n• ชำระครั้งเดียว ไม่มีค่าใช้จ่ายเพิ่มเติม\n• ดูแลหลังการขาย 3 วัน\n\nเลือกง่าย ๆ:\n• ต้องการสร้างหมุดพื้นฐาน → แพ็กเกจ 499 บาท\n• ต้องการข้อมูลครบ พร้อมช่องทางติดต่อและช่วยอ้างสิทธิ์ → แพ็กเกจ 1,000 บาท\n\nหมายเหตุ:\n• ดำเนินงานตามข้อมูลจริงและขั้นตอนของ Google\n• แจ้งขอบเขตงานให้ชัดเจนก่อนเริ่มงาน\n• รับงานแล้วติดตามจนเสร็จตามขอบเขตที่ตกลงกัน ไม่ทิ้งงาน\n\nสนใจแพ็กเกจไหน แจ้งได้เลยครับ เดี๋ยวผมส่งรายละเอียดเพื่อเริ่มงานให้ครับ' };
  if (asksOwnership) return { status: 'ready_to_quote', analysis: result, reply: 'จากที่ตรวจสอบ พบว่าธุรกิจของคุณมีหมุดบน Google Maps แล้วครับ แต่ยังไม่ได้อ้างสิทธิ์ความเป็นเจ้าของหมุด\n\nการอ้างสิทธิ์ช่วยให้คุณสามารถ:\n\n• เพิ่มรูปภาพและแก้ไขข้อมูลธุรกิจ\n• อัปเดตเวลาเปิด–ปิด\n• ตอบรีวิวลูกค้า\n• รับแจ้งเตือนทางอีเมลเมื่อมีการแก้ไขข้อมูล\n• จัดการหมุดได้ปลอดภัยและง่ายขึ้น\n\nหากทำเองไม่สะดวก ผมมีบริการช่วยอ้างสิทธิ์ให้ครับ\n\n• ค่าบริการ 990 บาท\n• ใช้เวลาประมาณ 1–5 วัน\n\nหากสนใจ แจ้งได้เลยครับ เดี๋ยวผมส่งรายละเอียดให้ครับ' };
  if (result.needsOwnerApproval) return { status: 'needs_owner', analysis: result, reply: 'ขอรายละเอียดเพิ่มเติมนิดนึงครับ รบกวนส่งลิงก์ Google Maps หรือแคปหน้าจอปัญหาที่พบมาได้เลยครับ เดี๋ยวผมตรวจสอบก่อนว่าแก้ไขได้ไหมและประเมินราคาให้ครับ' };
  if (result.matched.some(p => p.id === 'maps-basic')) return { status: 'ready_to_quote', analysis: result, reply: 'ปักหมุด Google Maps เริ่มต้น 499 บาทครับ ใช้เวลาประมาณ 1–2 วัน\nรบกวนส่งชื่อร้านหรือลิงก์ Google Maps มาให้ตรวจสอบก่อนนะครับ เพื่อเช็กว่าร้านมีหมุดอยู่แล้วหรือยัง จะได้ไม่ดำเนินการซ้ำครับ' };
  const lines = result.matched.map(p => '• ' + p.service + ' ' + baht(p.price) + ' ใช้เวลาประมาณ ' + p.days);
  return { status: 'ready_to_quote', analysis: result, reply: 'จากที่แจ้งมา แนะนำบริการดังนี้ครับ\n' + lines.join('\n') + '\n\nหากตรงกับที่ต้องการ แจ้งได้เลยครับ ผมจะส่งรายละเอียดเพื่อเริ่มงานให้ทันที' };
}

module.exports = { PACKAGES, analyzeMessage, buildReply };
