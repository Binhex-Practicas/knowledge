import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.document_page_dynamic = publicWidget.Widget.extend({
    selector: '.o_document_page_website_snippet',

    renderPage(page, sidebar, content, setActive = false) {
        if (setActive) {
            sidebar.querySelectorAll('.tree-node')
                .forEach(el => el.classList.remove('active'));
        }

        content.innerHTML = "";

        if (page.image) {
            const img = document.createElement("img");
            img.src = page.image;
            img.className = "img-fluid mb-2";
            content.appendChild(img);
        }

        if (page.author) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = "By: ";

            p.appendChild(strong);
            p.appendChild(document.createTextNode(page.author));
            content.appendChild(p);
        }

        const div = document.createElement("div");
        div.innerHTML = page.content || "";
        content.appendChild(div);

        return content;
    },

    renderNode(node, level, parentEl, context, visited = new Set()) {
        if (visited.has(node.id)) return;
        visited.add(node.id);

        const nodeEl = document.createElement("div");
        nodeEl.className = "tree-node d-flex align-items-center";
        nodeEl.style.setProperty("--level", level);

        nodeEl.dataset.open = "0";

        const icon = document.createElement("i");
        icon.className = "fa fa-chevron-right me-1";

        const label = document.createElement("span");
        label.className = "label";
        label.textContent = node.name;

        nodeEl.appendChild(icon);
        nodeEl.appendChild(label);

        const childrenWrapper = document.createElement("div");
        childrenWrapper.className = "children-wrapper";
        childrenWrapper.style.display = "none";

        nodeEl._wrapper = childrenWrapper;

        parentEl.appendChild(nodeEl);
        parentEl.appendChild(childrenWrapper);

        (node.pages || []).forEach(page => {
            const pageEl = document.createElement("div");
            pageEl.className = "tree-node page-node d-flex align-items-center";
            pageEl.style.setProperty("--level", level + 1);

            const icon = document.createElement("i");
            icon.className = "fa fa-file-text-o me-1";

            const label = document.createElement("span");
            label.textContent = page.name;

            pageEl.appendChild(icon);
            pageEl.appendChild(label);

            context.pageMap.set(page.id, page);
            pageEl.dataset.pageId = page.id;

            childrenWrapper.appendChild(pageEl);

            if (!context.firstRendered) {
                pageEl.classList.add("active");
                context.renderPage(page, context.sidebar, context.content, true);
                context.firstRendered = true;
            }
        });

        (node.children || []).forEach(child => {
            this.renderNode(child, level + 1, childrenWrapper, context, visited);
        });
    },

    async start() {
        const container = this.el.querySelector(".container");
        const sidebar = container.querySelector(".tree-sidebar");
        const content = container.querySelector(".content-area");

        sidebar.innerHTML = "";
        content.innerHTML = "";

        let tree = [];

        try {
            tree = await rpc("/document_page_website/pages", {});
        } catch (e) {
            content.innerHTML = `<p style="color:red;">Failed to load data</p>`;
            return;
        }

        const selectedIds = (this.el.dataset.categoryIds || "")
            .split(",")
            .map(id => parseInt(id))
            .filter(Boolean);

        if (selectedIds.length) {
            tree = tree.filter(node => selectedIds.includes(node.id));

            if (!tree.length) {
                content.innerHTML = `<p>No documents selected.</p>`;
                return;
            }
        }

        const context = {
            sidebar,
            content,
            firstRendered: false,
            pageMap: new Map(),
            renderPage: this.renderPage.bind(this),
        };

        const fragment = document.createDocumentFragment();

        tree.forEach(root => {
            this.renderNode(root, 1, fragment, context, new Set());
        });

        sidebar.appendChild(fragment);

        sidebar.addEventListener("click", (e) => {
            const pageNode = e.target.closest(".tree-node.page-node");
            if (pageNode && sidebar.contains(pageNode)) {
                const id = parseInt(pageNode.dataset.pageId);
                const page = context.pageMap.get(id);

                if (!page) return;

                context.activeNode?.classList.remove("active");
                context.activeNode = pageNode;
                pageNode.classList.add("active");

                context.renderPage(page, sidebar, content, false);
                return;
            }

            const catNode = e.target.closest(".tree-node:not(.page-node)");
            if (catNode && sidebar.contains(catNode)) {

                const wrapper = catNode._wrapper;
                if (!wrapper) return;

                const isOpen = catNode.dataset.open === "1";

                catNode.dataset.open = isOpen ? "0" : "1";
                wrapper.style.display = isOpen ? "none" : "block";

                const icon = catNode.querySelector("i.fa-chevron-right");
                if (icon) {
                    icon.style.transform = isOpen
                        ? "rotate(0deg)"
                        : "rotate(90deg)";
                    icon.style.transition = "0.15s";
                }
            }
        });
    },
});
