from odoo import models, fields

class DocumentPage(models.Model):
    _inherit = "document.page"

    is_published = fields.Boolean(string="Published", default = False)
