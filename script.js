let data = [];

// JSON読込
async function loadData() {
    try {
        const response = await fetch("data.json");
        data = await response.json();

        renderList();
    } catch (error) {
        console.error("JSON読込失敗", error);
    }
}

// 一覧表示
function renderList() {
    const list = document.getElementById("list");

    list.innerHTML = "";

    data.forEach(game => {

        const playerText =
            game.players[0] === game.players[1]
                ? `${game.players[0]}人`
                : `${game.players[0]}〜${game.players[1]}人`;

        const sectionsHtml = game.sections
            .map(section => `
                <div class="item">
                    <div class="balloon">
                        ${section.title}
                    </div>

                    <div class="desc">
                        ${section.content}
                    </div>
                </div>
            `)
            .join("");

        const html = `
            <button class="accordion">
                <div class="acc-left">
                    ${game.name}
                </div>

                <div class="acc-right">
                    <div>
                        ${playerText}
                    </div>

                    <div>
                        ${game.time}分
                    </div>
                </div>
            </button>

            <div class="content">
                <div class="inner">
                    <div class = "summary-area">
                        <img
                        src="${game.summary.image}"
                        alt="${game.name}"
                        class="game-image"
                        >
                        <div class="summary-info">

                            <div class="summary-item">
                                <div class="balloon summary-balloon">
                                    ざっくり
                                </div>

                                <div class="desc summary-desc">
                                    ${game.summary.overview}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="item">
                        <div class="balloon">
                            条件
                        </div>

                        <div class="desc">
                            ${game.summary.condition}
                        </div>
                    </div>

                    ${sectionsHtml}

                    <a href="#" onclick="openModal('${game.id}'); return false;">
                        詳細を見る
                    </a>

                </div>
            </div>
        `;

        list.insertAdjacentHTML("beforeend", html);
    });

    setupAccordion();
}

// アコーディオン
function setupAccordion() {

    const acc =
        document.querySelectorAll(".accordion");

    acc.forEach(button => {

        button.addEventListener("click", () => {

            const content =
                button.nextElementSibling;

            if (content.style.maxHeight) {

                content.style.maxHeight = null;
                button.classList.remove("open");

            } else {

                content.style.maxHeight =
                    content.scrollHeight + "px";

                button.classList.add("open");
            }

        });

    });

}

// モーダル表示
function openModal(id) {

    const game =
        data.find(g => g.id === id);

    if (!game) return;

    document.getElementById("modal").style.display =
        "block";

    document.getElementById("modal-title").textContent =
        game.name;

    document.getElementById("modal-description").textContent =
        game.modal.description;
}

// モーダル閉じる
function closeModal() {

    document.getElementById("modal").style.display =
        "none";

}

// 初期表示
loadData();