const menuBtn = document.getElementById('mobile-menu-btn');
const navLeft = document.querySelector('.nav-left');
const navRight = document.querySelector('.nav-right');

menuBtn.addEventListener('click', () => {
    navLeft.classList.toggle('active');
    navRight.classList.toggle('active');
    menuBtn.classList.toggle('open');
});


//for parents section
// スクロール時のフェードインアニメーション
document.addEventListener("DOMContentLoaded", function() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // 画面に入ったら'active'クラスを追加
                observer.unobserve(entry.target); // 一度表示したら監視を止める
            }
        });
    }, {
        threshold: 0.1 // 10%見えたら実行
    });

    fadeElements.forEach(el => {
        observer.observe(el);
    });
});


/**
 * 言語切り替え機能
 * @param {string} lang - 'ja' または 'en'
 */
function switchLanguage(lang) {
    // 全ての日本語要素と英語要素を取得
    const jaElements = document.querySelectorAll('.lang-ja');
    const enElements = document.querySelectorAll('.lang-en');
    
    // スイッチボタンの取得
    const btnJa = document.getElementById('btn-ja');
    const btnEn = document.getElementById('btn-en');

    if (lang === 'en') {
        // 日本語を隠して英語を表示
        jaElements.forEach(el => el.style.display = 'none');
        enElements.forEach(el => el.style.display = 'block');
        // ボタンの見た目を更新
        btnEn.classList.add('active');
        btnJa.classList.remove('active');
    } else {
        // 英語を隠して日本語を表示
        jaElements.forEach(el => el.style.display = 'block');
        enElements.forEach(el => el.style.display = 'none');
        // ボタンの見た目を更新
        btnJa.classList.add('active');
        btnEn.classList.remove('active');
    }
}


// Calendar
async function buildFullMonthSchedule() {
    const url = 'https://script.google.com/macros/s/AKfycbx45xlPh2cgjVs6WwNCSd-YzBWIZJ7xdi-0An4ilpqg1kFpJVfUnxDYwLQT9VvtSfBEzA/exec';
    const tbody = document.getElementById('schedule-body');
    if (!tbody) return;

    try {
        const response = await fetch(url);
        const events = await response.json();
        
        // 当月の情報を取得
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 今月の末日

        let html = '';
        const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

        // 1日から末日までループ
// buildFullMonthSchedule 関数内のループ部分を修正
for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayIndex = currentDate.getDay(); // 0:日, 6:土
    const dayOfWeek = dayNames[dayIndex];
    const dateStr = `${month + 1}/${day}`;
    
    // 祝日判定（簡易版：内閣府の祝日データ等を使わない場合、固定日のみ判定。
    // 必要であれば外部APIや祝日判定ライブラリと連携も可能です）
    // ここでは日曜日と同じ扱いにするためのフラグとします
    let dateClass = "td-date";
    if (dayIndex === 0) dateClass += " sun"; // 日曜
    if (dayIndex === 6) dateClass += " sat"; // 土曜
    
    const dayEvents = events.filter(ev => {
        const evDate = new Date(ev.start);
        return evDate.getDate() === day && evDate.getMonth() === month;
    });

    if (dayEvents.length > 0) {
        dayEvents.forEach(ev => {
            const time = new Date(ev.start).getHours() + ":" + String(new Date(ev.start).getMinutes()).padStart(2, '0');
            html += `
                <tr class="has-event">
                    <td class="${dateClass}">${dateStr}<span class="dow">(${dayOfWeek})</span></td>
                    <td class="td-time">${time}〜</td>
                    <td class="td-title">${ev.title}</td>
                    <td class="td-location">${ev.location ? ev.location.replace('小学校', '小') : '白金小'}</td>
                </tr>`;
        });
    } else {
        html += `
            <tr class="no-event">
                <td class="${dateClass}">${dateStr}<span class="dow">(${dayOfWeek})</span></td>
                <td class="td-time">--:--</td>
                <td class="td-title blanck-text">-</td>
                <td class="td-location">-</td>
            </tr>`;
    }
}
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4">読み込みエラー</td></tr>';
    }
}
document.addEventListener('DOMContentLoaded', buildFullMonthSchedule);




//schedule modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('schedule-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    // ★修正ポイント：テーブル全体に対してクリックを監視する（後から追加された行にも対応）
    document.addEventListener('click', (e) => {
        // クリックされた要素から、一番近い「tr」を探す
        const row = e.target.closest('.schedule-table tr');
        
        // trが見つかり、かつ「予定がない日（no-event）」でなければ実行
        if (row && !row.classList.contains('no-event')) {
            
            // 行内の各データを取得
            const dateHtml = row.querySelector('.td-date').innerHTML;
            const dateClass = row.querySelector('.td-date').className;
            const time = row.querySelector('.td-time').innerText;
            const title = row.querySelector('.td-title').innerText;
            const location = row.querySelector('.td-location').innerText;

            // モーダルへ流し込み
            const modalDate = document.getElementById('modal-date-badge');
            modalDate.innerHTML = dateHtml;
            modalDate.className = dateClass;
            
            document.getElementById('modal-title').innerText = title;
            document.getElementById('modal-time').innerText = time;
            document.getElementById('modal-location').innerText = location;

            // 表示
            modal.classList.add('active');
        }
    });

    // 閉じるボタン
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});