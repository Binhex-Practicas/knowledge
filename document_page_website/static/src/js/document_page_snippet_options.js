/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";
import { rpc } from "@web/core/network/rpc";

const DocumentPageOptions = options.Class.extend({

    async _renderCustomXML(uiFragment) {
        await this._super(...arguments);

        const select = uiFragment.querySelector('we-select[data-name="categories"]');
        if (!select) {
            console.warn("Select not found");
            return;
        }

        let categories = [];
        try {
            categories = await rpc('/document_page_website/pages', {});
        } catch (e) {
            console.error("RPC failed", e);
            return;
        }

        categories.forEach(cat => {
            const btn = document.createElement('we-button');
            btn.textContent = cat.name;

            btn.dataset.selectDataAttribute = cat.id;

            select.appendChild(btn);
        });
    },

    selectDataAttribute(previewMode, widgetValue, params) {
        this._super(...arguments);

        if (params.attributeName === 'categories' && !previewMode) {
            this.$target[0].dataset.categoryIds = widgetValue;
        }
    },

});

options.registry.DocumentPageOptions = DocumentPageOptions;
export default DocumentPageOptions;
