const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
let rowCount = 0;

function addRow() {
  rowCount++;
  const rid = rowCount;
  const tbody = document.getElementById('otBody');
  const tr = document.createElement('tr');
  tr.id = 'row-' + rid;

  const dayOpts = DAYS.map(d => `<option>${d}</option>`).join('');
  const s  = 'border:1.5px solid transparent;border-radius:6px;height:30px;font-family:\'Sarabun\',sans-serif;font-size:13px;color:#1a1a2e;background:transparent;transition:all .2s;';
  const mo = `this.style.borderColor='#d1d5db';this.style.background='#f9fafb'`;
  const mu = `if(document.activeElement!==this){this.style.borderColor='transparent';this.style.background='transparent'}`;
  const fo = `this.style.borderColor='#2d6a9f';this.style.background='#fff'`;

  tr.innerHTML = `
    <td class="row-num">${rid}</td>
    <td><select id="day-${rid}" onchange="calcRow(${rid})" style="${s}width:88px;padding:0 4px;cursor:pointer" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"><option value="">-</option>${dayOpts}</select></td>
    <td><input type="date" id="date-${rid}" oninput="autoFillDay(${rid})" style="${s}width:130px;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="time" id="start-${rid}" oninput="calcRow(${rid})" style="${s}width:96px;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="time" id="end-${rid}" oninput="calcRow(${rid})" style="${s}width:96px;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td class="hrs-cell" id="hrs-${rid}">-</td>
    <td><input type="number" id="rate-${rid}" placeholder="บาท/ชม." oninput="calcRow(${rid})" style="${s}width:82px;padding:0 6px;text-align:center" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="text" class="detail-input" id="detail-${rid}" placeholder="ระบุรายละเอียดงาน..." style="${s}width:100%;padding:0 8px;text-align:left" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="text" id="approve-${rid}" placeholder="ชื่อผู้อนุมัติ" style="${s}width:100%;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
  `;
  tbody.appendChild(tr);
}
function removeLastRow() {
    // เลือกแถวทั้งหมดที่มีอยู่ใน tbody ของตารางปฏิบัติงาน
    // (ปรับเปลี่ยน Selector ให้ตรงกับโครงสร้างตารางหลักของคุณได้ครับ)
    let rows = document.querySelectorAll('tbody tr');
    
    // ตั้งเงื่อนไขป้องกัน: ป้องกันไม่ให้ลบจนเกลี้ยงตาราง อย่างน้อยต้องเหลือไว้ 1 แถวเริ่มต้น
    if (rows.length > 1) {
        // ลบแถวตัวสุดท้ายสุดออก (.length - 1)
        rows[rows.length - 1].remove();
        
        // 🔥 สำคัญมาก: เรียกฟังก์ชันคำนวณผลรวมชั่วโมงและเงินใหม่ตรงนี้
        // ให้เปลี่ยนชื่อฟังก์ชันด้านล่างนี้ให้ตรงกับชื่อฟังก์ชันคำนวณเดิมในระบบของคุณนะครับ
        if (typeof calculateTotals === "function") {
            calculateTotals();
        } else if (typeof updateTotals === "function") {
            updateTotals();
        }
    } else {
        alert('ต้องมีรายการปฏิบัติงานล่วงเวลาอย่างน้อย 1 แถวครับ');
    }
}

function autoFillDay(rid) {
  const dateEl = document.getElementById('date-' + rid);
  if (!dateEl.value) return;
  const d = new Date(dateEl.value);
  document.getElementById('day-' + rid).value = DAYS[d.getDay()];
  calcRow(rid);
}

function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function calcRow(rid) {
  const s = document.getElementById('start-' + rid).value;
  const e = document.getElementById('end-' + rid).value;
  const hrsEl = document.getElementById('hrs-' + rid);
  if (s && e) {
    let diff = toMin(e) - toMin(s);
    if (diff < 0) diff += 1440;
    hrsEl.textContent = (diff / 60).toFixed(2);
    hrsEl.style.color = '#2d6a9f';
  } else {
    hrsEl.textContent = '-';
    hrsEl.style.color = '#9ca3af';
  }
  updateTotal();
}

function updateTotal() {
  let total = 0;
  for (let i = 1; i <= rowCount; i++) {
    const el = document.getElementById('hrs-' + i);
    if (el && el.textContent !== '-') total += parseFloat(el.textContent) || 0;
  }
  document.getElementById('totalHrs').textContent = total.toFixed(2);
}

function calcSummary() {
  let totalHrs = 0, totalBaht = 0;
  for (let i = 1; i <= 3; i++) {
    const r = parseFloat(document.getElementById('rate' + i).value) || 0;
    const h = parseFloat(document.getElementById('hrs' + i).value) || 0;
    const sub = r * h;
    document.getElementById('sum' + i).textContent = sub.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalHrs += h;
    totalBaht += sub;
  }
  document.getElementById('totalSumHrs').textContent = totalHrs.toFixed(2);
  document.getElementById('totalSumBaht').textContent = totalBaht.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clearAll() {
  if (!confirm('ยืนยันการล้างข้อมูลทั้งหมด?')) return;
  document.getElementById('otBody').innerHTML = '';
  rowCount = 0;
  document.getElementById('totalHrs').textContent = '0.00';
  ['hrs1','hrs2','hrs3'].forEach(id => document.getElementById(id).value = '');
  ['sum1','sum2','sum3'].forEach(id => document.getElementById(id).textContent = '0.00');
  document.getElementById('totalSumHrs').textContent = '0.00';
  document.getElementById('totalSumBaht').textContent = '0.00';
  ['empName','empYear','sigEmp','dateEmp','sigApprove','dateApprove'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('empMonth').value = '';
  for (let i = 0; i < 5; i++) addRow();
}

for (let i = 0; i < 5; i++) addRow();