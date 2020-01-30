import logging
import shutil
from os import path

from elrond_sc import config, downloader, environment, utils

logger = logging.getLogger("projects")


def create_project(name, template, destination_folder):
    logger.info("create_project.name: %s", name)
    logger.info("create_project.template: %s", template)
    logger.info("create_project.destination_folder: %s", destination_folder)

    _download_templates_archive()
    tools_folder = environment.get_tools_folder()
    template_folder = path.join(config.TEMPLATES_PATH_AFTER_UNZIP, template)
    source_path = path.join(template_folder, tools_folder)
    destination_path = path.join(destination_folder, name)

    if not path.isdir(source_path):
        raise Exception(f"Template missing: {source_path}")

    shutil.copytree(source_path, destination_path)

    logger.info("Project created.")


def _download_templates_archive():
    url = config.TEMPLATES_ARCHIVE
    tools_folder = environment.get_tools_folder()
    archive = path.join(tools_folder, "templates.zip")
    downloader.download(url, archive)
    templates_folder = path.join(tools_folder, "templates")
    utils.unzip(archive, templates_folder)
