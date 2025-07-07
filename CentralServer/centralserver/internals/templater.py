from jinja2 import Environment, FileSystemLoader, select_autoescape

from centralserver.internals.config_handler import app_config

templater = Environment(
    loader=FileSystemLoader(app_config.mailing.templates_dir),
    autoescape=select_autoescape(),
)
