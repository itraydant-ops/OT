const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
let rowCount = 0;

// 📌 แนะนำ: ตรวจสอบด้านบนสุดของไฟล์ script.js ด้วยนะคร้บว่ามีตัวแปร let rowCount = 5; (หรือตามจำนวนแถวเริ่มต้น) ประกาศไว้แล้วหรือยัง

function addRow() {
  rowCount++; // เพิ่มค่าตัวแปรนับแถว
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
  updateRowNumbers();
}

function removeLastRow() {
    let rows = document.querySelectorAll('#otBody tr');
    
    if (rows.length > 1) {
        // ลบแถวล่าสุดออกจากหน้าจอ
        rows[rows.length - 1].remove();
        
        // 🔥 จุดสำคัญ: ต้องลบค่าตัวแปรนับแถวถอยหลังด้วย เพื่อไม่ให้ ID ชนกันเวลาเพิ่มแถวใหม่
        rowCount--; 
        
        // สั่งคำนวณยอดรวมใหม่ทันทีหลังจากลบแถว
        // (ตรวจสอบชื่อฟังก์ชันคำนวณเงินรวมในไฟล์ของคุณอีกครั้งนะครับ หากไม่ใช่ calcRow หรือ calcAll ให้เปลี่ยนชื่อตรงนี้)
        if (typeof calcAll === "function") {
            calcAll();
        } else if (typeof updateTotals === "function") {
            updateTotals();
        }
        
        // จัดลำดับเลขข้อ 1, 2, 3, 4 ใหม่ให้ถูกต้อง
        updateRowNumbers();
    } else {
        alert('ต้องมีรายการปฏิบัติงานล่วงเวลาอย่างน้อย 1 แถวครับ');
    }
}

function autoFillDay(rid) {
  const dateEl = document.getElementById('date-' + rid);
  if (!dateEl.value) return;
  const d = new Date(dateEl.value);
  document.getElementById('day-' + rid).value = DAYS[d.getDay()];
  if (typeof calcRow === "function") {
      calcRow(rid);
  }
}

// ฟังก์ชันเคลียร์และจัดเลขลำดับ (ครั้งที่) ด้านหน้าตารางให้เรียงถูกต้อง 1, 2, 3... เสมอ
function updateRowNumbers() {
    const rows = document.querySelectorAll('#otBody tr');
    rows.forEach((row, index) => {
        const numCell = row.querySelector('.row-num');
        if (numCell) {
            numCell.textContent = index + 1;
        }
    });
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