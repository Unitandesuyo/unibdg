
let data = [];

// JSON読込
async function loadData() {
    try {
        const listResponse =
            await fetch("data/list.json");

        const gameList =
            await listResponse.json();

        const games = [];
        //jsonファイルを1つずつ読み込み
        for (const game of gameList) {
            try {
                const response =
                    await fetch(game.file);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const json =
                    await response.json();

                games.push(json);

            } catch (error) {
                console.error(`${game.file}の読み込み失敗`, error);
            }
        }

        data = games;

        renderList();
    } catch (error) {
        console.error("JSON読込失敗", error);
    }
}

//テキスト装飾
function parseText(text) {

    return text
        .replace(
            /<b>(.*?)<\/b>/g,
            "<strong>$1</strong>"
        )
        .replace(
            /<mark>(.*?)<\/mark>/g,
            '<span class="marker">$1</span>'
        )
        .replace(
            /<note>(.*?)<\/note>/g,
            '<span class="note">$1</span>'
        )
        .replace(
            /<warning>(.*?)<\/warning>/g,
            '<span class="warning">$1</span>'
        )
        .replace(
            /<heading>(.*?)<\/heading>/g,
            '<span class="heading">$1</span>'
        )
        .replace(
            /<step>(.*?)<\/step>/g,
            '<span class="step">$1</span>'
        );

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

        const tagsHtml =
            (game.tags || [])
                .map(tag => `
            <span class="game-tag">
                ${tag}
            </span>
        `)
                .join("");


        const sectionsHtml = game.sections
            .map(section => {
                if (section.type === "modal") {
                    return `
                        <div class="section-item" onclick="openSectionModal('${game.id}', '${section.title}')">
                            <span>${section.title}</span>
                            <span class="modal-icon">→</span>
                        </div>
                    `;
                }
                if (section.type === "accordion") {
                    if (section.accordionType === "steps") {
                        // 手順専用レイアウト

                        const contentHtml =
                            section.content
                                .map(item => `

                <div class="step-row">

                    <div class="step-no">
                        ${item.step}
                    </div>

                    <div class="step-text">
                        ${item.text.join("<br>")}
                    </div>

                </div>

            `)
                                .join("");

                        return `
        <div class="section-item section-accordion">
            <span>${section.title}</span>
            <span class="accordion-icon">></span>
        </div>

        <div class="section-ac-content">
            <div class="inner section-content">
                ${contentHtml}
            </div>
        </div>
    `;

                    } else {
                        // 通常レイアウト
                    }
                    const contentHtml =
                        parseText(
                            Array.isArray(section.content)
                                ? section.content.join("<br>")
                                : section.content
                        );


                    return `
                        <div class="section-item section-accordion">
                            <span>${section.title}</span>
                            <span class="accordion-icon">></span>

                        </div>
                        <div class="section-ac-content">
                            <div class="inner section-content">
                                ${contentHtml}
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
                    ${game.subtitle
                ? `<div class="game-subtitle">${game.subtitle}</div>`
                : ""}
                    
                </div>

                <div class="acc-right">
                    <div class="game-basic">
                        ${playerText}・${game.time}分
                    </div>

                    <div class="game-tags">
                    ${tagsHtml}
                    </div>
                </div>
            </button>

            <div class="content">
                <div class="inner">
                    <div class = "summary-area">
                        <div class="summary-image">
                            <img
                            src="${game.summary.image}"
                            alt="${game.name}"
                            class="game-image"
                            >
                        </div>

                        <div class="summary-info">

                            <div class="summary-item">
                                <div class="summary-balloon">
                                    ざっくりこんなゲーム
                                </div>

                                <div class="desc summary-desc">${game.summary.overview}</div>
                                </div>
                                <div class="summary-memo">
                                    ${game.summary.memo}
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

// モーダル閉じる
function closeModal() {

    document.getElementById("modal").style.display =
        "none";

    document.body.style.overflow = "";

}

//モーダル内の要素
// モーダル内の要素
function renderDetailItem(item) {

    // テキスト
    if (item.type === "text") {

        return `
            <div class="detail-text" style="font-size:${item.fontSize || '15px'}; width:${item.width || '100%'};">
                ${parseText(
            item.content.join("<br>")
        )}
            </div>
        `;
    }

    // 画像
    if (item.type === "image") {

        return `
            <figure class="detail-figure" style="width:${item.width || '80%'};
            margin-left:${item.width ? '0' : 'auto'}; margin-right:${item.width ? '0' : 'auto'};">

            <img src="${item.src}" class="detail-image">
            ${item.caption
                ? `
                <figcaption class="detail-caption">
                   ${item.caption}
                </figcaption>
            `
                : ""
            }

            </figure>
        `;
    }

    // 横並び
    if (item.type === "row") {

        return `
            <div class="detail-row">
                ${item.items
                .map(renderDetailItem)
                .join("")}
            </div>
        `;
    }

    // 表
    if (item.type === "table") {

        const colgroup = item.columnWidths
            ? `
            <colgroup>
                ${item.columnWidths
                .map(w => `<col style="width:${w};">`)
                .join("")}
            </colgroup>
        `
            : "";

        const headerHtml = item.headers
            ? `
            <tr>
                ${item.headers
                .map(h => `
                        <th
                            style="
                                font-size:${item.headerFontSize || '1rem'};
                            "
                        >
                            ${parseText(h)}
                        </th>
                    `)
                .join("")}
            </tr>
        `
            : "";

        const rowsHtml = item.rows
            .map(row => `
        <tr>
            ${row.map((cell, index) => `
                <td
                    style="
                        font-size:${index === 0
                    ? (item.rowFontSize || item.cellFontSize || '0.9rem')
                    : (item.cellFontSize || '0.9rem')
                };
                    "
                >
                    ${parseText(cell)}
                </td>
            `).join("")}
        </tr>
    `)
            .join("");

        return `
        <div class="detail-table-wrap">
            <table class="detail-table">
                ${colgroup}
                ${headerHtml}
                ${rowsHtml}
            </table>
        </div>
    `;
    }

    return "";
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

    document.body.style.overflow = "hidden";

    document.getElementById("modal-title").textContent =
        section.title;
    // FAQ専用レイアウト
    if (section.modalType === "faq") {
        const modalHtml =
            section.content
                .map(item => `
            <div class="faq-question">
                <div class="faq-question-mark">
                    Q
                </div>
                <div class="faq-question-text">
                    ${item.question}
                </div>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-mark">
                    A
                </div>
                <div class="faq-answer-text">
                    ${item.answer.join("<br>")}
                </div>
            </div>
        `)
                .join("");

        document.getElementById("modal-description").innerHTML =
            modalHtml;
        setupFaqAccordion();
    }

    else if (section.modalType === "detail") {

        const modalHtml =

            section.content
                .map(block => {

                    const layoutHtml =
                        block.layout
                            .map(renderDetailItem)
                            .join("");

                    return `
                    <div class="detail-step">

                        ${block.title
                            ? `
                                <div class="detail-title">
                                    ${block.title}
                                </div>
                              `
                            : ""
                        }

                        ${layoutHtml}

                    </div>
                `;

                })
                .join("");

        document.getElementById("modal-description").innerHTML =
            modalHtml;
    }


    else if (
        Array.isArray(section.content) &&
        section.content.length > 0 &&
        typeof section.content[0] === "object"
    ) {

        const modalHtml =
            section.content
                .map(item => `
                <div class="section-item section-accordion">
                    ${item.title}
                </div>

                <div class="section-ac-content">
                    <div class="inner section-content">
                        ${item.content.join("<br>")}
                    </div>
                </div>
            `)
                .join("");

        document.getElementById("modal-description").innerHTML =
            modalHtml;

        setupSectionAccordion();

    } else {

        document.getElementById("modal-description").innerHTML =
            Array.isArray(section.content)
                ? section.content.join("<br>")
                : section.content;

    }
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


                if (parentContent) {
                    parentContent.style.maxHeight = "9999px";
                }
            });

        });

    });

}

/*Q&A専用アコーディオン*/
function setupFaqAccordion() {

    const questions =
        document.querySelectorAll(".faq-question");

    questions.forEach(question => {

        question.addEventListener("click", () => {

            const answer =
                question.nextElementSibling;

            if (answer.style.maxHeight) {

                answer.style.maxHeight = null;

            } else {

                answer.style.maxHeight =
                    answer.scrollHeight + "px";

            }

        });

    });

}



// 初期表示
loadData();