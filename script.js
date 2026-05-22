const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
let rowCount = 0;

// 1. ฟังก์ชันเพิ่มแถวตาราง
function addRow() {
  rowCount++; 
  const rid = rowCount;
  const tbody = document.getElementById('otBody');
  if (!tbody) return;

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

// 2. ฟังก์ชันลบแถวตารางล่าสุด
function removeLastRow() {
    let rows = document.querySelectorAll('#otBody tr');
    
    if (rows.length > 1) {
        rows[rows.length - 1].remove();
        updateRowNumbers();
        updateTotal(); 
    } else {
        alert('ต้องมีรายการปฏิบัติงานล่วงเวลาอย่างน้อย 1 แถวครับ');
    }
}

// 3. ฟังก์ชันเลือกวันอัตโนมัติจากปฏิทิน
function autoFillDay(rid) {
  const dateEl = document.getElementById('date-' + rid);
  if (!dateEl || !dateEl.value) return;
  const d = new Date(dateEl.value);
  const daySelect = document.getElementById('day-' + rid);
  if (daySelect) {
    daySelect.value = DAYS[d.getDay()];
  }
  calcRow(rid);
}

// 4. ฟังก์ชันรีรันเลขลำดับข้อ (ครั้งที่)
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
function calcRow(rid) {
  const startEl = document.getElementById('start-' + rid);
  const endEl = document.getElementById('end-' + rid);
  const hrsCell = document.getElementById('hrs-' + rid);

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
    endTotalMins += 24 * 60; 
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

// 8. ฟังก์ชันเคลียร์หน้าจอทั้งหมด
function clearAll() {
  if (!confirm('ยืนยันการล้างข้อมูลทั้งหมด?')) return;
  const tbody = document.getElementById('otBody');
  if (tbody) tbody.innerHTML = '';
  
  rowCount = 0;
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
  
  for (let i = 0; i < 5; i++) addRow();
}

// 📌 บรรทัดสั่งรันแถวเริ่มต้น 5 แถวตอนเปิดเว็บ
for (let i = 0; i < 5; i++) addRow();