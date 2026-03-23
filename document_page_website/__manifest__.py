{
    "name": "Document Page Website Snippet",
    "version": "18.0.1.0.0",
    "category": "Website",
    "summary": "Embed a published document page inside another page",
    "author": "Patricia Ojeda P.",
    "license": "AGPL-3",
    "depends": [
        "website",
        "web_editor",
        "document_page",
    ],
    "data": [
        "views/document_page_views.xml",
        "views/snippet_template.xml",
        "views/snippet.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "document_page_website/static/src/js/document_page_dynamic.js",
        ],
    },
    "installable": True,
}
