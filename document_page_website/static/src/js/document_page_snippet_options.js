/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";
import { rpc } from "@web/core/network/rpc";

const DocumentPageOptions = options.Class.extend({
    async _renderCustomXML(uiFragment) {
        await this._super(...arguments);

        const container = uiFragment.querySelector('.o_category_multi_select');
        if (!container) return;

        container.innerHTML = "";

        let categories = [];
        try {
            categories = await rpc('/document_page_website/pages', {});
        } catch (e) {
            console.error("RPC failed", e);
            return;
        }

        const el = this.$target?.[0];

        const getSelectedIds = () =>
            (el.dataset.categoryIds || "")
                .split(",")
                .filter(Boolean)
                .map(id => parseInt(id, 10))
                .filter(Number.isFinite);

        const setSelectedIds = (arr) => {
            el.dataset.categoryIds = arr.join(",");
        };

        categories.forEach(cat => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn-sm m-1";
            btn.textContent = cat.name;

            const refreshUI = () => {
                const selected = getSelectedIds();
                const active = selected.includes(cat.id);

                btn.classList.toggle("btn-primary", active);
                btn.classList.toggle("btn-secondary", !active);
            };

            btn.addEventListener("click", () => {
                let selected = getSelectedIds();

                if (selected.includes(cat.id)) {
                    selected = selected.filter(x => x !== cat.id);
                } else {
                    selected.push(cat.id);
                }

                setSelectedIds(selected);
                refreshUI();
            });

            refreshUI();
            container.appendChild(btn);
        });
    },
});

options.registry.DocumentPageOptions = DocumentPageOptions;
export default DocumentPageOptions;
