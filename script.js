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
            .map(section => {
                if (section.type === "modal") {
                    return `
                        <div class="section-item" onclick="openSectionModal('${game.id}', '${section.title}')">
                            <span>${section.title}</span>
                        </div>
                    `;
                }
                if (section.type === "accordion") {
                    return `
                        <div class="section-item section-accordion">
                            ${section.title}
                        </div>
                        <div class="section-ac-content">
                            <div class="inner section-content">
                                ${section.content}
                            </div>
                        </div>
                    `;
                }
                return "";
            })
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

                    ${sectionsHtml}

                </div>
            </div>
        `;

        list.insertAdjacentHTML("beforeend", html);
    });

    setupAccordion();
    setupSectionAccordion();
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

//アコーディオン内のモーダル
function openSectionModal(gameId, sectionTitle) {

    const game =
        data.find(g => g.id === gameId);

    if (!game) return;

    const section =
        game.sections.find(
            s => s.title === sectionTitle
        );

    if (!section) return;

    document.getElementById("modal").style.display =
        "block";

    document.getElementById("modal-title").textContent =
        section.title;

    document.getElementById("modal-description").textContent =
        section.content;
}

//子アコーディオンの開閉処理
function setupSectionAccordion() {

    const accordions =
        document.querySelectorAll(".section-accordion");

    accordions.forEach(item => {

        item.addEventListener("click", () => {

            const content =
                item.nextElementSibling;

            if (content.style.maxHeight) {

                content.style.maxHeight = null;

            } else {

                content.style.maxHeight =
                    content.scrollHeight + "px";

            }

            requestAnimationFrame(() => {

                const parentContent =
                    item.closest(".content");


                parentContent.style.maxHeight = "9999px";
            });

        });

    });

}

// 初期表示
loadData();