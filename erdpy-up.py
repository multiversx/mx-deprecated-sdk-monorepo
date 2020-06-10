import logging
import os
import subprocess
import sys

logger = logging.getLogger("installer")

MIN_REQUIRED_PYTHON_MAJOR_VERSION = 3
MIN_REQUIRED_PYTHON_MINOR_VERSION = 6


def main():
    logging.basicConfig(level=logging.DEBUG)

    operating_system = get_operating_system()

    python_major_version = sys.version_info.major
    python_minor_version = sys.version_info.minor
    python_version_string = f"{python_major_version}.{python_minor_version}"

    logger.info("Checking user.")
    if os.getuid() == 0:
        raise Exception("You should not install erdpy as root.")

    logger.info("Checking Python version.")
    logger.info(f"Python version: {sys.version_info}")
    if python_major_version < MIN_REQUIRED_PYTHON_MAJOR_VERSION or (python_major_version >= MIN_REQUIRED_PYTHON_MAJOR_VERSION and python_minor_version < MIN_REQUIRED_PYTHON_MINOR_VERSION):
        raise Exception("You need Python 3.6 or later.")

    logger.info("Checking operating system.")
    logger.info(f"Operating system: {operating_system}")
    if operating_system != "linux" and operating_system != "osx":
        raise Exception("Your operating system is not supported yet.")

    logger.info("Checking pip.")
    try:
        import pip
        print("pip", pip.__version__)
    except ImportError:
        raise Exception("[pip] is not installed. Please install [pip3] first.")

    logger.info("Checking PATH variable.")
    PATH = os.environ["PATH"]

    if operating_system == "linux":
        required_path = "${HOME}/.local/bin"
        required_path_expanded = os.path.expanduser("~/.local/bin")
    else:
        required_path = "${HOME}/Library/Python/{python_version_string}/bin"
        required_path_expanded = os.path.expanduser(f"~/Library/Python/{python_version_string}/bin")

    if required_path_expanded not in PATH:
        profile_file = get_profile_file()

        logger.info(f"""
In order to register [erdpy] as a command, your [$PATH] environment variable should include the folder [{required_path_expanded}].
Please edit the file "{profile_file}" and add the following line:

    export PATH={required_path}:${{PATH}}

Then, restart the user session and retry the [erdpy] installer.
        """)
        return
    else:
        logger.info(f"Your $PATH environment variable contains the necessary path [{required_path_expanded}].")

    logger.info("Perform actual installation via pip.")
    try:
        env = {
            "PYTHONIOENCODING": "utf8"
        }
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "--user", "--no-cache-dir", "erdpy"], env=env)
    except Exception:
        raise Exception("Could not install [erdpy].")

    logger.info("Checking if [erdpy] command is registered correctly.")
    try:
        subprocess.check_call(["erdpy", "--version"])
    except Exception:
        raise Exception("[erdpy] command not registered correctly. Please contact us at https://t.me/ElrondDevelopers.")

    logger.info("You have successfully installed erdpy. For more information go to https://docs.elrond.com.")


def get_operating_system():
    aliases = {
        "linux": "linux",
        "linux1": "linux",
        "linux2": "linux",
        "darwin": "osx",
        "win32": "windows",
        "cygwin": "windows",
        "msys": "windows"
    }

    operating_system = aliases.get(sys.platform)
    if operating_system is None:
        raise Exception(f"Unknown platform: {sys.platform}")

    return operating_system


def get_profile_file():
    operating_system = get_operating_system()

    if operating_system == "linux":
        return "~/.profile"
    else:
        if "ZSH_VERSION" in os.environ:
            return "~/.zshrc"
        else:
            return "~/.bash_profile"


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        logger.fatal(err)
        sys.exit(1)
