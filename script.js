// 1. データの保持用変数を「必ず」一番上で定義
let cachedEvents = []; 

// UI制御
const menuBtn = document.getElementById('mobile-menu-btn');
const navLeft = document.querySelector('.nav-left');
const navRight = document.querySelector('.nav-right');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLeft.classList.toggle('active');
        navRight.classList.toggle('active');
        menuBtn.classList.toggle('open');
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));
});

// スケジュール取得
async function buildFullMonthSchedule() {
    const url = 'https://script.google.com/macros/s/AKfycbwAMIQJDLGST8RV2B9u26SFzfX11Yq60b7IAbbqnCftnC0neRX3Zu3XwP7G3TT66CdeOg/exec';
    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;

    try {
        const response = await fetch(url);
        const events = await response.json();

        // ★ここでグローバル変数に保存
        cachedEvents = events;
        console.log("Data loaded:", cachedEvents.length, "events");

        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'none';

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';
        const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dayIndex = currentDate.getDay();
            const dayOfWeek = dayNames[dayIndex];
            const dateStr = `${month + 1}/${day}`;
            
            let dateClass = "td-date";
            if (dayIndex === 0) dateClass += " sun"; 
            if (dayIndex === 6) dateClass += " sat"; 
            
            const dayEvents = events.filter(ev => {
                const evDate = new Date(ev.日付);
                return evDate.getDate() === day && evDate.getMonth() === month;
            });

            if (dayEvents.length > 0) {
                dayEvents.forEach(ev => {
                    const evJson = JSON.stringify(ev).replace(/"/g, '&quot;');
                    let startTime = ev.開始時間;
                    if (startTime && startTime.includes('1899')) startTime = "09:00"; 
                    const targetAudience = ev.対象学年 || '全学年';

                    html += `
                        <tr class="has-event" onclick="openModal(${evJson})">
                            <td class="${dateClass}">${dateStr}<span class="dow">(${dayOfWeek})</span></td>
                            <td class="td-time">${startTime}〜</td>
                            <td class="td-title">${ev.イベント名}</td>
                            <td class="td-target" style="color: #ff0000; font-weight: bold; font-size: 0.85rem; text-align: right; padding-right: 15px;">
                                ${targetAudience}
                            </td>
                        </tr>`;
                });
            } else {
                html += `
                    <tr class="no-event">
                        <td class="${dateClass}">${dateStr}<span class="dow">(${dayOfWeek})</span></td>
                        <td class="td-time">--:--</td>
                        <td class="td-title blanck-text">-</td>
                        <td class="td-target">-</td>
                    </tr>`;
            }
        }
        tbody.innerHTML = html;
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

// モーダル
function openModal(ev) {
    const modal = document.getElementById('schedule-modal');
    if (!modal) return;

    // --- 日付バッジの整形 ---
    const d = new Date(ev.日付);
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dayOfWeek = dayNames[d.getDay()];

    const badge = document.getElementById('modal-date-badge');
    if (badge) {
        badge.innerHTML = `<div style="font-size: 3.5rem; line-height: 1.1;">${month}/${date} <span style="font-size: 0.6em; vertical-align: middle;">(${dayOfWeek})</span></div>`;
        badge.style.cssText = `background-color: #00bfff; color: white; padding: 15px 40px; border-radius: 12px; font-weight: 900; display: flex; align-items: center; justify-content: center; text-align: center; margin: 0 auto 25px auto; width: fit-content; min-width: 220px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); white-space: nowrap;`;
    }

    // --- 💡 イベント名（タイトル）の背景＆枠デザイン ---
// --- 💡 イベント名（タイトル）の背景＆枠デザイン（さらに微調整版） ---
    const titleEl = document.getElementById('modal-title');
    if (titleEl) {
        titleEl.innerText = ev.イベント名;
        titleEl.style.cssText = `
            background: linear-gradient(to right, #f0faff, #ffffff); /* 左から右へ白く抜けるグラデーション */
            color: #003366;                /* 濃いネイビーの文字 */
            border-left: 6px solid #00bfff; /* 左側の線を少し太くしてアクセントに */
            padding: 15px 20px;
            margin: 10px 0 25px 0;
            font-size: 1.4rem;             /* 少しサイズを整えました */
            border-radius: 4px;
            text-align: left;
            font-weight: 800;              /* 文字をより太く */
            letter-spacing: 0.02em;
        `;
    }
    
    // --- 各ラベルの組み立て（境界線を付けて整理） ---
    const labels = [
        { id: 'modal-time', title: '時間', value: `${ev.開始時間} 〜 ${ev.終了時間}`, eng: 'TIME' },
        { id: 'modal-target', title: '対象学年', value: ev.対象学年 || '全学年', eng: 'TARGET' },
        { id: 'modal-location', title: '場所', value: ev.場所 || '白金小グラウンド', eng: 'LOCATION' },
        { id: 'modal-message', title: '備考', value: ev.備考 || '特記事項はありません。', eng: 'MESSAGE' }
    ];

    labels.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                let val = item.value;
                if (val.includes('1899')) val = "09:00 〜 12:00";

                // 💡 見出し（日本語＆英語）の部分にうっすら背景色とパディングを追加
            el.innerHTML = `
                <div style="margin-top: 18px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                    <div style="background: #e6f2ff; 
                                padding: 10px 14px;
                                border-radius: 6px;
                                display: flex;
                                align-items: center;
                                margin-bottom: 8px;">
                        <span style="color: #003366; font-size: 0.95rem; font-weight: bold;">${item.title}</span>
                        <span style="color: #0099cc; font-size: 0.75rem; margin-left: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${item.eng}
                        </span>
                    </div>
                    <div style="font-size: 1.15rem; color: #222; font-weight: 500; padding-left: 12px; line-height: 1.4;">
                        ${val}
                    </div>
                </div>
                `;
            }
        });

    // 体験ボタン等のフッターを非表示
    const applyBtn = document.querySelector('.modal-footer');
    if (applyBtn) applyBtn.style.display = 'none';
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) modal.classList.remove('active');
}

// カレンダー切り替え
function toggleView(view) {
    const listView = document.getElementById('schedule-list-view');
    const calendarView = document.getElementById('schedule-calendar-view');
    const btnList = document.getElementById('tab-list');
    const btnCal = document.getElementById('tab-cal');

    if (view === 'cal') {
        listView.style.display = 'none';
        calendarView.style.display = 'block';
        if(btnList) btnList.classList.remove('active');
        if(btnCal) btnCal.classList.add('active');
        renderCalendar();
    } else {
        listView.style.display = 'block';
        calendarView.style.display = 'none';
        if(btnList) btnList.classList.add('active');
        if(btnCal) btnCal.classList.remove('active');
    }
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    if (cachedEvents.length === 0) {
        grid.innerHTML = '<p style="padding:20px;">データを読み込み中です...</p>';
        return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 曜日のヘッダー
    let html = '<div class="calendar-days">';
    ["日", "月", "火", "水", "木", "金", "土"].forEach(d => html += `<div class="day-name">${d}</div>`);
    html += '</div><div class="calendar-cells">';

    // 先月の空白
    for (let i = 0; i < firstDay; i++) html += '<div class="cell empty"></div>';

    // 日付マスの生成
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = cachedEvents.filter(ev => {
            const d = new Date(ev.日付);
            return d.getDate() === day && d.getMonth() === month;
        });

        let eventHtml = '';
        dayEvents.forEach(ev => {
            const evJson = JSON.stringify(ev).replace(/"/g, '&quot;');
            const target = ev.対象学年 || '-';

            // 💡 スマホ視認性重視：学年（赤）<br>イベント名（黒）
            eventHtml += `
                <div class="cal-event" onclick="openModal(${evJson})" 
                     style="background: none; color: inherit; padding: 5px 0; border-bottom: 1px dashed #eee; cursor: pointer;">
                    <div style="color: #ff0000; font-weight: bold; font-size: 0.7rem; line-height: 1.2;">
                        ${target}
                    </div>
                    <div style="color: #333; font-size: 0.75rem; line-height: 1.2; font-weight: 500;">
                        ${ev.イベント名}
                    </div>
                </div>`;
        });

        // 💡 組み立てた eventHtml を cell に流し込む
        html += `
            <div class="cell">
                <span class="day-num">${day}</span>
                <div class="event-container">${eventHtml}</div>
            </div>`;
    }
    html += '</div>';
    grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    buildFullMonthSchedule();
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
});

function switchLanguage(lang) {
    const btnJa = document.getElementById('btn-ja');
    const btnEn = document.getElementById('btn-en');
    if (!btnJa || !btnEn) return;

    // 1. ボタンの活性化状態を切り替え
    if (lang === 'ja') {
        btnJa.classList.add('active');
        btnEn.classList.remove('active');
    } else {
        btnEn.classList.add('active');
        btnJa.classList.remove('active');
    }

    // 2. HTML内の lang-ja と lang-en クラスを持つ要素をすべて取得
    const jaElements = document.querySelectorAll('.lang-ja');
    const enElements = document.querySelectorAll('.lang-en');

    // 3. 表示・非表示を切り替え
    if (lang === 'ja') {
        jaElements.forEach(el => el.style.display = 'block');
        enElements.forEach(el => el.style.display = 'none');
    } else {
        jaElements.forEach(el => el.style.display = 'none');
        enElements.forEach(el => el.style.display = 'block');
    }
}


/*------------------------- trial session modal --------------------------*/
const modal = document.getElementById("imageModal");
const flyerTrigger = document.getElementById("flyerTrigger");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementsByClassName("modal-close")[0];

// クリックでモーダル表示
flyerTrigger.onclick = function() {
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    // 表示中の画像のソースをモーダルにコピー
    modalImg.src = this.querySelector('img').src; 
}

// 閉じるボタンか、背景クリックで閉じる
modal.onclick = function(e) {
    if (e.target !== modalImg) {
        modal.style.display = "none";
    }
}
/*------------------------- trial session modal --------------------------*/
