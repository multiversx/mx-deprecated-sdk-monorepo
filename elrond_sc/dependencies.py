
import logging
from os import path

from elrond_sc import config, environment, downloader, utils

logger = logging.getLogger("dependencies")


def install_llvm(version="v9"):
    logger.info("install_llvm.version: %s", version)

    url = _get_url_llvm(version)
    tools_folder = environment.get_tools_folder()
    archive = path.join(tools_folder, "vendor-llvm.v9.tar.gz")
    downloader.download(url, archive)
    llvm_folder = path.join(tools_folder, "llvm-folder")
    utils.untar(archive, llvm_folder)

    logger.info("Install done.")


def _get_url_llvm(version):
    root_url = f"{config.DOWNLOAD_MIRROR}/vendor-llvm/{version}"

    urls = {
        "linux": f"{root_url}/linux-amd64.tar.gz",
        "osx": f"{root_url}/darwin-amd64.tar.gz",
        "windows": f"{root_url}/windows-amd64.tar.gz",
    }

    platform = environment.get_platform()
    url = urls.get(platform)
    return url
