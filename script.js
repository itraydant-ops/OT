const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// 1. ฟังก์ชันเพิ่มแถวตาราง (ใช้ Date.now() สร้าง Unique ID ป้องกัน ID ซ้ำกันเมื่อลบหรือรันเลขข้อใหม่)
function addRow() {
  const tbody = document.getElementById('otBody');
  if (!tbody) return;

  const rid = Date.now() + Math.random().toString(36).substr(2, 5); // Unique ID ชั่วคราวสำหรับอิลิเมนต์
  const tr = document.createElement('tr');

  const dayOpts = DAYS.map(d => `<option>${d}</option>`).join('');
  const s  = 'border:1.5px solid transparent;border-radius:6px;height:30px;font-family:\'Sarabun\',sans-serif;font-size:13px;color:#1a1a2e;background:transparent;transition:all .2s;';
  const mo = `this.style.borderColor='#d1d5db';this.style.background='#f9fafb'`;
  const mu = `if(document.activeElement!==this){this.style.borderColor='transparent';this.style.background='transparent'}`;
  const fo = `this.style.borderColor='#2d6a9f';this.style.background='#fff'`;

  tr.innerHTML = `
    <td class="row-num"></td>
    <td><select class="day-select" onchange="calcRow(this)" style="${s}width:88px;padding:0 4px;cursor:pointer" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"><option value="">-</option>${dayOpts}</select></td>
    <td><input type="date" class="date-input" oninput="autoFillDay(this)" style="${s}width:130px;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="time" class="start-input" oninput="calcRow(this)" style="${s}width:96px;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="time" class="end-input" oninput="calcRow(this)" style="${s}width:96px;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td class="hrs-cell">-</td>
    <td><input type="number" class="rate-input" placeholder="บาท/ชม." oninput="calcRow(this)" style="${s}width:82px;padding:0 6px;text-align:center" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="text" class="detail-input" placeholder="ระบุรายละเอียดงาน..." style="${s}width:100%;padding:0 8px;text-align:left" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
    <td><input type="text" class="approve-input" placeholder="ชื่อผู้อนุมัติ" style="${s}width:100%;padding:0 6px" onmouseover="${mo}" onmouseout="${mu}" onfocus="${fo}"></td>
  `;
  
  tbody.appendChild(tr);
  updateRowNumbers();
}

// 2. ฟังก์ชันลบแถวตารางล่าสุด
function removeLastRow() {
    const rows = document.querySelectorAll('#otBody tr');
    
    if (rows.length > 1) {
        rows[rows.length - 1].remove();
        updateRowNumbers();
        updateTotal(); 
    } else {
        alert('ต้องมีรายการปฏิบัติงานล่วงเวลาอย่างน้อย 1 แถวครับ');
    }
}

// 3. ฟังก์ชันเลือกวันอัตโนมัติจากปฏิทิน (เปลี่ยนมาอ้างอิงผ่าน Node/Element เพื่อไม่ให้สคริปต์พังเวลา Clone หน้า)
function autoFillDay(element) {
  const row = element.closest('tr');
  if (!row) return;

  const dateEl = row.querySelector('.date-input');
  if (!dateEl || !dateEl.value) return;

  const d = new Date(dateEl.value);
  const daySelect = row.querySelector('.day-select');
  if (daySelect) {
    daySelect.value = DAYS[d.getDay()];
  }
  calcRow(element);
}

// 4. ฟังก์ชันรีรันเลขลำดับข้อ (ครั้งที่) ให้ถูกต้องเรียบร้อยเสมอ
function updateRowNumbers() {
    const rows = document.querySelectorAll('#otBody tr');
    rows.forEach((row, index) => {
        const numCell = row.querySelector('.row-num');
        if (numCell) {
            numCell.textContent = index + 1;
        }
    });
}

// 5. ฟังก์ชันคำนวณชั่วโมงของแต่ละแถว
function calcRow(element) {
  const row = element.closest('tr');
  if (!row) return;

  const startEl = row.querySelector('.start-input');
  const endEl = row.querySelector('.end-input');
  const hrsCell = row.querySelector('.hrs-cell');

  if (!startEl || !endEl || !hrsCell) return;

  const startTime = startEl.value; 
  const endTime = endEl.value;

  if (!startTime || !endTime) {
    hrsCell.textContent = '-';
    hrsCell.style.color = '#9ca3af';
    updateTotal();
    return;
  }

  function parseTimeToMinutes(timeStr) {
    let hours = 0;
    let minutes = 0;
    const isAmpm = timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm');
    
    if (isAmpm) {
      const ampm = timeStr.match(/[a-zA-Z]+/)[0].toUpperCase();
      const timePart = timeStr.replace(/[a-zA-Z]+/g, '').trim();
      const parts = timePart.split(':').map(Number);
      hours = parts[0];
      minutes = parts[1] || 0;
      
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      const parts = timeStr.split(':').map(Number);
      if (parts.length >= 2) {
        hours = parts[0];
        minutes = parts[1];
      }
    }
    return (hours * 60) + minutes;
  }

  const startTotalMins = parseTimeToMinutes(startTime);
  let endTotalMins = parseTimeToMinutes(endTime);

  if (endTotalMins < startTotalMins) {
    endTotalMins += 24 * 60; // รองรับกรณีทำงานล่วงเวลาข้ามวัน (หลังเที่ยงคืน)
  }

  const diffMins = endTotalMins - startTotalMins;
  const diffHrs = diffMins / 60;

  hrsCell.textContent = diffHrs.toFixed(2);
  hrsCell.style.color = '#2d6a9f';

  updateTotal(); 
}

// 6. ฟังก์ชันรวมชั่วโมงสะสมทั้งหมดในตารางใหญ่
function updateTotal() {
  let total = 0;
  const hrsCells = document.querySelectorAll('#otBody .hrs-cell');
  
  hrsCells.forEach(cell => {
    if (cell && cell.textContent !== '-') {
      total += parseFloat(cell.textContent) || 0;
    }
  });
  
  const totalHrsEl = document.getElementById('totalHrs');
  if (totalHrsEl) {
    totalHrsEl.textContent = total.toFixed(2);
  }
}

// 7. ฟังก์ชันคำนวณเงินในสรุปตารางล่าง
function calcSummary() {
  let totalHrs = 0, totalBaht = 0;
  for (let i = 1; i <= 3; i++) {
    const r = parseFloat(document.getElementById('rate' + i).value) || 0;
    const h = parseFloat(document.getElementById('hrs' + i).value) || 0;
    const sub = r * h;
    
    const sumEl = document.getElementById('sum' + i);
    if (sumEl) {
      sumEl.textContent = sub.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    totalHrs += h;
    totalBaht += sub;
  }
  
  const totalSumHrsEl = document.getElementById('totalSumHrs');
  const totalSumBahtEl = document.getElementById('totalSumBaht');
  
  if (totalSumHrsEl) totalSumHrsEl.textContent = totalHrs.toFixed(2);
  if (totalSumBahtEl) totalSumBahtEl.textContent = totalBaht.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 8. ฟังก์ชันเคลียร์หน้าจอและล้างข้อมูลทั้งหมด
function clearAll() {
  if (!confirm('ยืนยันการล้างข้อมูลทั้งหมด?')) return;
  const tbody = document.getElementById('otBody');
  if (tbody) tbody.innerHTML = '';
  
  const totalHrsEl = document.getElementById('totalHrs');
  if (totalHrsEl) totalHrsEl.textContent = '0.00';
  
  ['hrs1','hrs2','hrs3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['sum1','sum2','sum3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '0.00';
  });
  
  const totalSumHrsEl = document.getElementById('totalSumHrs');
  const totalSumBahtEl = document.getElementById('totalSumBaht');
  if (totalSumHrsEl) totalSumHrsEl.textContent = '0.00';
  if (totalSumBahtEl) totalSumBahtEl.textContent = '0.00';
  
  ['empName','empYear','sigEmp','dateEmp','sigApprove','dateApprove'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  const empMonthEl = document.getElementById('empMonth');
  if (empMonthEl) empMonthEl.value = '';
  
  // สร้างแถวเริ่มต้นกลับมา 5 แถว
  for (let i = 0; i < 5; i++) addRow();
}

// 📌 บรรทัดสั่งรันแถวเริ่มต้น 5 แถวทันทีเมื่อเปิดเบราว์เซอร์ครั้งแรก
document.addEventListener("DOMContentLoaded", function() {
  const tbody = document.getElementById('otBody');
  if (tbody && tbody.children.length === 0) {
    for (let i = 0; i < 5; i++) addRow();
  }
});