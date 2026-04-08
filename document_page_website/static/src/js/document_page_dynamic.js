import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.document_page_dynamic = publicWidget.Widget.extend({
    selector: '.o_document_page_website_snippet',

    async start() {
        const container = this.$target.find('.container');
        const sidebar = container.find('.tree-sidebar');
        const content = container.find('.content-area');

        sidebar.empty();
        content.empty();

        let tree = [];

        try {
            tree = await rpc('/document_page_website/pages', {});
        } catch (e) {
            content.html(`<p style="color:red;">Failed to load data</p>`);
            return;
        }

        const selectedIds = (this.$target.attr('data-category-ids') || "")
            .split(',')
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

        let filteredTree = tree;

        if (selectedIds.length) {
            filteredTree = tree.filter(node => selectedIds.includes(node.id));

            if (!filteredTree.length) {
                content.html(`<p>No documents selected.</p>`);
                return;
            }
        }

        let firstRendered = false;

        const renderNode = (node, level = 1) => {
            const indent = level * 15;

            const nodeEl = $(`
                <div class="tree-node d-flex align-items-center" style="padding-left:${indent}px;">
                    <i class="fa fa-chevron-right me-1 toggle-icon"></i>
                    <span class="label">${node.name}</span>
                </div>
            `);

            const childrenWrapper = $(`<div class="children-wrapper"></div>`).hide();

            nodeEl.on('click', (e) => {
                e.stopPropagation();

                const icon = nodeEl.find('.toggle-icon');
                const isOpen = childrenWrapper.is(':visible');

                if (isOpen) {
                    childrenWrapper.slideUp(150);
                    icon.removeClass('fa-chevron-down').addClass('fa-chevron-right');
                } else {
                    childrenWrapper.slideDown(150);
                    icon.removeClass('fa-chevron-right').addClass('fa-chevron-down');
                }
            });

            sidebar.append(nodeEl);
            sidebar.append(childrenWrapper);

            const renderPage = (page, setActive = false) => {
                if (setActive) {
                    sidebar.find('.tree-node').removeClass('active');
                }

                content.html(`
                    ${page.image ? `<img src="${page.image}" class="img-fluid mb-2"/>` : ''}
                    ${page.author ? `<p><strong>By: </strong> ${page.author}</p>` : ''}
                    <div>${page.content}</div>
                `);
            };

            (node.pages || []).forEach((page, index) => {
                const pageEl = $(`
                    <div class="tree-node page-node d-flex align-items-center"
                         style="padding-left:${indent + 15}px;">
                        <i class="fa fa-file-text-o me-1"></i>
                        <span>${page.name}</span>
                    </div>
                `);

                pageEl.on('click', (e) => {
                    e.stopPropagation();

                    sidebar.find('.tree-node').removeClass('active');
                    pageEl.addClass('active');

                    renderPage(page, false);
                });

                childrenWrapper.append(pageEl);

                if (!firstRendered) {
                    pageEl.addClass('active');
                    renderPage(page, true);
                    firstRendered = true;
                }
            });

            (node.children || []).forEach(child => {
                renderNode(child, level + 1);
            });
        };

        filteredTree.forEach(root => renderNode(root));

        if (!firstRendered) {
            content.html(`<p>No pages available.</p>`);
        }
    },
});
