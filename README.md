# Sales Agent Backend (โหมดทดสอบ)

## เริ่มใช้งาน

```powershell
node server.js
```

ตรวจสอบระบบที่ `http://localhost:3000/health`

ทดสอบวิเคราะห์ข้อความ:

```powershell
Invoke-RestMethod http://localhost:3000/analyze -Method Post -ContentType 'application/json' -Body '{"message":"อยากสร้าง Facebook Page และ LINE OA ครับ"}'
```

## เชื่อม Meta ภายหลัง

- Webhook verification: `GET /webhook`
- Event receiver: `POST /webhook`
- ต้องนำเซิร์ฟเวอร์ขึ้น HTTPS ก่อนใส่ Callback URL ใน Meta
- ตั้งค่า `META_VERIFY_TOKEN`, `META_APP_SECRET` และ `META_PAGE_ACCESS_TOKEN` ในระบบโฮสต์
- `META_APP_SECRET` ใช้ตรวจสอบลายเซ็น Webhook
- `META_PAGE_ACCESS_TOKEN` ใช้ส่งคำตอบกลับ Facebook Page
- ไฟล์ `render.yaml` เตรียมไว้สำหรับ Deploy บน Render
- ระบบจะตอบกลับอัตโนมัติเมื่อมี Page Access Token แล้ว ควรทดสอบด้วยเพจทดสอบก่อน
