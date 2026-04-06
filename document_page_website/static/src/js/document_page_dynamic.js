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
                                data-bs-toggle="collapse"
                                data-bs-target="#${collapseId}">
                            ${category.name}
                        </button>
                    </h2>

                    <div id="${collapseId}"
                         class="accordion-collapse collapse"
                         data-bs-parent="#docAccordion">
                        <div class="accordion-body"></div>
                    </div>
                </div>
            `);

            const body = item.find('.accordion-body');

            item.find('.accordion-collapse').on('shown.bs.collapse', function () {
                item[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });

            item.find('.accordion-collapse').on('hidden.bs.collapse', function () {
                item.find('.accordion-button').removeClass('active-category');
            });

            item.find('button').on('click', () => {
                if (body.children().length) return;

                const wrapper = $(`
                    <div class="d-flex">
                        <div class="page-sidebar me-3" style="min-width: 220px;"></div>
                        <div class="page-content-area flex-grow-1"></div>
                    </div>
                `);

                const sidebar = wrapper.find('.page-sidebar');
                const contentArea = wrapper.find('.page-content-area');

                category.pages.forEach((page, index) => {

                    const pageLink = $(`
                        <div class="page-link-item p-2 border-bottom"
                             style="cursor:pointer;">
                            ${page.name}
                        </div>
                    `);

                    pageLink.on('click', () => {
                        sidebar.find('.page-link-item').removeClass('active');
                        pageLink.addClass('active');

                        contentArea.html(`
                            ${page.image ? `<img src="${page.image}" class="img-fluid mb-2"/>` : ''}
                            ${page.author ? `<p><strong>By:</strong> ${page.author}</p>` : ''}
                            <div>${page.content}</div>
                        `);
                    });

                    sidebar.append(pageLink);

                    if (index === 0) {
                        pageLink.addClass('active');
                        contentArea.html(`
                            ${page.image ? `<img src="${page.image}" class="img-fluid mb-2"/>` : ''}
                            ${page.author ? `<p><strong>By:</strong> ${page.author}</p>` : ''}
                            <div>${page.content}</div>
                        `);
                    }
                });

                body.append(wrapper);
            });

            accordion.append(item);
        });
    },
});
