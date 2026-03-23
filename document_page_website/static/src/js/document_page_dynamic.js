/** @odoo-module */

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.document_page_dynamic = publicWidget.Widget.extend({
    selector: '.o_document_page_website_snippet',

    async start() {
        const container = this.$target.find('.container');

        container.empty();

        const data = await rpc('/document_page_website/pages', {});

        if (!data.length) {
            container.html(`<p>No content found.</p>`);
            return;
        }

        const accordionId = "docAccordion";

        container.html(`<h3>Document Pages</h3>
            <div class="accordion" id="${accordionId}"></div>
        `);

        const accordion = container.find('.accordion');

        data.forEach((category, index) => {
            const collapseId = `collapse_${category.id}`;

            const item = $(`
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#${collapseId}">
                            ${category.name}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            <div class="row"></div>
                        </div>
                    </div>
                </div>
            `);

            const row = item.find('.row');

            item.find('button').on('click', function () {
                if (row.children().length > 0) {
                    return;
                }

                category.pages.forEach(page => {
                    const pageId = `page_${page.id}`;

                    const item = $(`
                        <div class="mb-2">
                            <div class="page-title" style="cursor:pointer; font-weight:bold;">
                                ${page.name}
                            </div>

                            <div id="${pageId}" class="page-content" style="display:none; margin-top:10px;">
                                ${page.image ? `<img src="${page.image}" class="img-fluid mb-2"/>` : ''}

                                ${page.author ? `<p><strong>By:</strong> ${page.author}</p>` : ''}

                                <div class="mb-2">${page.content}</div>

                                <small>
                                    <strong>Last update:</strong> ${page.last_update || ''}
                                </small>
                            </div>
                        </div>
                    `);

                    item.find('.page-title').on('click', function () {
                        const content = item.find('.page-content');

                        content.slideToggle();
                    });

                    row.append(item);
                });

            });

            accordion.append(item);
        });
    },
});
