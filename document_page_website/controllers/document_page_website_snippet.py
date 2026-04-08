from odoo import http
from odoo.http import request
from odoo.tools import html_sanitize


class DocumentPageWebsiteController(http.Controller):
    @http.route(
        '/document_page_website/pages',
        type='json',
        auth='public',
        website=True
    )
    def get_published_pages(self):
        pages = request.env['document.page'].sudo().search([
            ('is_published', '=', True),
            ('type', '=', 'content'),
        ])

        categories = request.env['document.page'].sudo().search([
            ('type', '=', 'category'),
        ])

        pages_by_category = {}

        def get_cat_id(page):
            return page.parent_id.id if page.parent_id else 0

        for page in pages:
            cat_id = get_cat_id(page)

            if cat_id not in pages_by_category:
                pages_by_category[cat_id] = []

            image = ''
            if page.image:
                image = f'data:image/png;base64,{page.image.decode()}'

            pages_by_category[cat_id].append({
                'id': page.id,
                'name': page.name,
                'author': page.content_uid.name if page.content_uid else '',
                'content': html_sanitize(page.content or ''),
                'last_update': page.content_date,
                'image': image,
            })

        category_map = {}

        for cat in categories:
            category_map[cat.id] = {
                'id': cat.id,
                'name': cat.name,
                'parent_id': cat.parent_id.id if cat.parent_id else None,
                'pages': pages_by_category.get(cat.id, []),
                'children': []
            }

        tree = []

        for cat_id, cat in category_map.items():
            if cat['parent_id']:
                parent = category_map.get(cat['parent_id'])
                if parent:
                    parent['children'].append(cat)
            else:
                tree.append(cat)

        return tree
