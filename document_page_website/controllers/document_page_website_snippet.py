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

        categories = {}

        for page in pages:
            category = page.parent_id

            id = category.id if category else 0
            name = category.name if category else "Uncategorized"

            if id not in categories:
                categories[id] = {
                    "id": id,
                    "name": name,
                    "pages": []
                }

            image = ''
            if page.image:
                image = f'data:image/png;base64,{page.image.decode()}'

            categories[id]['pages'].append({
                'id': page.id,
                'name': page.name,
                'author': page.content_uid.name if page.content_uid else '',
                'content': html_sanitize(page.content or ''),
                'last_update': page.content_date,
                'image': image,
            })

        return list(categories.values())
