import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.document_page_dynamic = publicWidget.Widget.extend({
    selector: '.o_document_page_website_snippet',

    async start() {
        const container = this.$target.find('.container');
        container.empty();

        let categories = [];
        try {
            categories = await rpc('/document_page_website/pages', {});
        } catch (error) {
            console.error("RPC FAILED:", error);
            container.html(`<p style="color:red;">Failed to load data</p>`);
            return;
        }

        const selectedIds = (this.$target.attr('data-category-ids') || "")
            .split(',')
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

        if (!selectedIds.length) {
            container.html(`<p>No documents selected.</p>`);
            return;
        }

        const filteredData = categories.filter(cat => selectedIds.includes(cat.id));

        const accordion = $('<div class="accordion" id="docAccordion"></div>');
        container.append('<h3>Document Pages</h3>', accordion);

        filteredData.forEach(category => {
            const collapseId = `collapse_${category.id}`;
            const item = $(`
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button"
                                data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                            ${category.name}
                        </button>
                    </h2>
                    <div id="${collapseId}" class="accordion-collapse collapse">
                        <div class="accordion-body"><div class="row"></div></div>
                    </div>
                </div>
            `);

            const row = item.find('.row');
            item.find('button').on('click', () => {
                if (row.children().length) return;
                category.pages.forEach(page => {
                    const pageItem = $(`
                        <div class="mb-2">
                            <div class="page-title" style="cursor:pointer; font-weight:bold;">
                                ${page.name}
                            </div>
                            <div class="page-content" style="display:none;">
                                ${page.image ? `<img src="${page.image}" class="img-fluid mb-2"/>` : ''}
                                ${page.author ? `<p><strong>By:</strong> ${page.author}</p>` : ''}
                                <div>${page.content}</div>
                            </div>
                        </div>
                    `);
                    pageItem.find('.page-title').on('click', () => pageItem.find('.page-content').slideToggle());
                    row.append(pageItem);
                });
            });

            accordion.append(item);
        });
    },
});
