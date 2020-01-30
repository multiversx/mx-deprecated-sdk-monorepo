import logging
from argparse import ArgumentParser

from elrond_sc import dependencies, projects


def main():
    logging.basicConfig(level=logging.DEBUG)
    print("main")
    
    #dependencies.install_llvm("v9")
    projects.create_project(name="foobar", template="simple-counter", destination_folder="/home/.../Desktop/workspaces/sandbox_sc")


if __name__ == "__main__":
    main()
